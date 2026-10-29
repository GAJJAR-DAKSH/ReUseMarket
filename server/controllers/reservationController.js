const Reservation = require('../models/Reservation');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const { generateHandoverCode } = require('../services/codeGenerator');

// Helper to auto-expire past reservations
const checkAndExpireReservations = async () => {
  const now = new Date();
  const expiredReservations = await Reservation.find({
    status: 'Confirmed',
    expiresAt: { $lt: now }
  });

  for (const resv of expiredReservations) {
    resv.status = 'Expired';
    await resv.save();

    // Release listing back to Available if it was tied to this reservation
    await Listing.findOneAndUpdate(
      { _id: resv.listing, activeReservation: resv._id, status: 'Reserved' },
      { status: 'Available', activeReservation: null }
    );
  }
};

// @desc    Create a reservation for an available listing
// @route   POST /api/reservations
// @access  Private
const createReservation = async (req, res, next) => {
  try {
    const { listingId, pickupTime, pickupLocation, note, durationHours = 48 } = req.body;

    if (!listingId || !pickupTime) {
      return res.status(400).json({ message: 'Listing ID and pickup time are required' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot reserve your own listing' });
    }

    if (listing.status !== 'Available') {
      return res.status(400).json({
        message: `This item is currently ${listing.status.toLowerCase()} and cannot be reserved.`
      });
    }

    // Server-side check for any existing active reservation on this listing
    const existingActive = await Reservation.findOne({
      listing: listingId,
      status: { $in: ['Pending', 'Confirmed'] },
      expiresAt: { $gt: new Date() }
    });

    if (existingActive) {
      return res.status(400).json({
        message: 'This item is already reserved by another student.'
      });
    }

    const pickupDate = new Date(pickupTime);
    const expiresAt = new Date(Date.now() + Math.min(durationHours, 72) * 60 * 60 * 1000);
    const handoverCode = generateHandoverCode();

    // Create reservation with generated handover code
    const reservation = await Reservation.create({
      listing: listingId,
      buyer: req.user._id,
      seller: listing.seller,
      status: 'Confirmed',
      pickupTime: pickupDate,
      pickupLocation: pickupLocation || listing.pickupLocation,
      note: note || '',
      expiresAt,
      handoverCode, // stored securely
      handoverCodeVerified: false
    });

    // Atomically lock listing to Reserved status
    const updatedListing = await Listing.findOneAndUpdate(
      { _id: listingId, status: 'Available' },
      { status: 'Reserved', activeReservation: reservation._id },
      { new: true }
    );

    if (!updatedListing) {
      // Race condition caught: item was taken right before lock
      await Reservation.findByIdAndDelete(reservation._id);
      return res.status(409).json({
        message: 'Conflict: This listing was just reserved by another user. Please try again.'
      });
    }

    // Notify seller of reservation
    await Notification.create({
      recipient: listing.seller,
      sender: req.user._id,
      type: 'reservation_created',
      title: 'Item Reserved on Campus!',
      message: `${req.user.name} reserved "${listing.title}" for pickup at ${reservation.pickupLocation}. Please coordinate meeting.`,
      link: `/dashboard?tab=reservations`
    });

    // Return reservation with handover code visible ONLY to buyer
    const responseReservation = reservation.toObject();
    responseReservation.handoverCode = handoverCode;

    res.status(201).json({
      success: true,
      reservation: responseReservation,
      message: 'Item reserved successfully! Show your 6-digit handover code to the seller at pickup.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's reservations (as buyer or seller)
// @route   GET /api/reservations
// @access  Private
const getReservations = async (req, res, next) => {
  try {
    await checkAndExpireReservations();

    const { role } = req.query; // 'buyer', 'seller', or all
    const query = {};

    if (role === 'buyer') {
      query.buyer = req.user._id;
    } else if (role === 'seller') {
      query.seller = req.user._id;
    } else {
      query.$or = [{ buyer: req.user._id }, { seller: req.user._id }];
    }

    const reservations = await Reservation.find(query)
      .populate('buyer', 'name avatar email phone campusHostelOrBlock ratingAverage')
      .populate('seller', 'name avatar email phone campusHostelOrBlock ratingAverage')
      .populate('listing', 'title price images category condition pickupLocation status')
      .sort({ createdAt: -1 });

    // For safety: include handoverCode ONLY if current user is the buyer of that reservation
    const sanitizedReservations = reservations.map(r => {
      const obj = r.toObject();
      if (r.buyer._id.toString() !== req.user._id.toString()) {
        delete obj.handoverCode;
      }
      return obj;
    });

    res.json({
      success: true,
      count: sanitizedReservations.length,
      reservations: sanitizedReservations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single reservation detail
// @route   GET /api/reservations/:id
// @access  Private
const getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .select('+handoverCode')
      .populate('buyer', 'name avatar email phone campusHostelOrBlock ratingAverage')
      .populate('seller', 'name avatar email phone campusHostelOrBlock ratingAverage')
      .populate('listing', 'title price images category condition pickupLocation status');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only buyer, seller, or admin can access
    const isBuyer = reservation.buyer._id.toString() === req.user._id.toString();
    const isSeller = reservation.seller._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this reservation' });
    }

    const resObj = reservation.toObject();
    // Only buyer gets the code to show the seller
    if (!isBuyer && !isAdmin) {
      delete resObj.handoverCode;
    }

    res.json({
      success: true,
      reservation: resObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
const cancelReservation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const reservation = await Reservation.findById(req.params.id)
      .populate('listing')
      .populate('buyer', 'name')
      .populate('seller', 'name');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const isBuyer = reservation.buyer._id.toString() === req.user._id.toString();
    const isSeller = reservation.seller._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    if (reservation.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed handover' });
    }

    reservation.status = 'Cancelled';
    reservation.cancellationReason = reason || 'Cancelled by campus member';
    reservation.cancelledBy = req.user._id;
    await reservation.save();

    // Release listing back to Available
    await Listing.findByIdAndUpdate(reservation.listing._id, {
      status: 'Available',
      activeReservation: null
    });

    // Notify the counterparty
    const otherPartyId = isBuyer ? reservation.seller._id : reservation.buyer._id;
    await Notification.create({
      recipient: otherPartyId,
      sender: req.user._id,
      type: 'reservation_cancelled',
      title: 'Reservation Cancelled',
      message: `Reservation for "${reservation.listing.title}" was cancelled by ${req.user.name}. Item is back available on the market.`,
      link: `/listings/${reservation.listing._id}`
    });

    res.json({
      success: true,
      reservation,
      message: 'Reservation cancelled successfully and listing marked back as Available.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getReservations,
  getReservationById,
  cancelReservation
};

