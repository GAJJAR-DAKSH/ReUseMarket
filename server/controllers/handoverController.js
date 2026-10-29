const Reservation = require('../models/Reservation');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');

// @desc    Seller verifies the buyer's 6-digit code during in-person physical exchange
// @route   POST /api/handover/verify
// @access  Private (Seller only)
const verifyHandover = async (req, res, next) => {
  try {
    const { reservationId, handoverCode } = req.body;

    if (!reservationId || !handoverCode) {
      return res.status(400).json({ message: 'Reservation ID and 6-digit handover code are required' });
    }

    const reservation = await Reservation.findById(reservationId)
      .select('+handoverCode')
      .populate('listing')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation record not found' });
    }

    // Only the seller can enter and verify the buyer's code at meetup
    if (reservation.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the seller can verify the buyer\'s handover code' });
    }

    if (reservation.status === 'Completed') {
      return res.status(400).json({ message: 'This handover has already been completed and verified.' });
    }

    if (reservation.status === 'Cancelled' || reservation.status === 'Expired') {
      return res.status(400).json({ message: `Cannot verify code: reservation is ${reservation.status.toLowerCase()}` });
    }

    // Check expiration
    if (new Date() > new Date(reservation.expiresAt)) {
      reservation.status = 'Expired';
      await reservation.save();
      await Listing.findByIdAndUpdate(reservation.listing._id, {
        status: 'Available',
        activeReservation: null
      });
      return res.status(400).json({ message: 'Reservation has expired. Please create a new reservation.' });
    }

    // Check matching code
    if (reservation.handoverCode.trim() !== handoverCode.trim()) {
      return res.status(400).json({ message: 'Invalid 6-digit handover code. Please ask the buyer to check their reservation code.' });
    }

    // Code matches! Complete handover
    const now = new Date();
    reservation.status = 'Completed';
    reservation.handoverCodeVerified = true;
    reservation.handoverCompletedAt = now;
    // Invalidate code so it can never be reused
    reservation.handoverCode = 'VERIFIED_' + Date.now();
    await reservation.save();

    // Mark listing as Sold or Completed
    const finalListingStatus = reservation.listing.listingType === 'Free Donation' ? 'Completed' : 'Sold';
    await Listing.findByIdAndUpdate(reservation.listing._id, {
      status: finalListingStatus,
      activeReservation: null
    });

    // Notify buyer that handover was confirmed
    await Notification.create({
      recipient: reservation.buyer._id,
      sender: req.user._id,
      type: 'handover_completed',
      title: 'Handover Completed! 🎉',
      message: `Your exchange of "${reservation.listing.title}" with ${req.user.name} is complete! You can now rate and review this exchange.`,
      link: `/dashboard?tab=purchases`
    });

    // Notify seller
    await Notification.create({
      recipient: reservation.seller._id,
      sender: reservation.buyer._id,
      type: 'handover_completed',
      title: 'Exchange Completed! 🎉',
      message: `Handover for "${reservation.listing.title}" is officially recorded. Leave a review for ${reservation.buyer.name}!`,
      link: `/dashboard?tab=reservations`
    });

    res.json({
      success: true,
      reservation,
      message: 'Handover verified successfully! Exchange completed on campus.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyHandover
};

