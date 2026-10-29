const Offer = require('../models/Offer');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');

// @desc    Submit an offer or exchange proposal
// @route   POST /api/offers
// @access  Private
const createOffer = async (req, res, next) => {
  try {
    const { listingId, offerType, offeredPrice, exchangeItemDescription, message } = req.body;

    if (!listingId) {
      return res.status(400).json({ message: 'Listing ID is required' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Prevent seller from offering on their own item
    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot make an offer on your own listing' });
    }

    if (listing.status !== 'Available') {
      return res.status(400).json({ message: `Listing is currently ${listing.status} and cannot receive offers` });
    }

    // Check if user already has an active pending offer on this listing
    const existingOffer = await Offer.findOne({
      listing: listingId,
      buyer: req.user._id,
      status: { $in: ['Pending', 'Countered'] }
    });

    if (existingOffer) {
      return res.status(400).json({ message: 'You already have an active offer on this item. Please wait for the seller response.' });
    }

    const offer = await Offer.create({
      listing: listingId,
      buyer: req.user._id,
      seller: listing.seller,
      offerType: offerType || 'Price Offer',
      offeredPrice: offerType === 'Item Exchange' ? 0 : Number(offeredPrice) || 0,
      exchangeItemDescription: exchangeItemDescription || '',
      message: message || '',
      status: 'Pending'
    });

    // Send notification to seller
    await Notification.create({
      recipient: listing.seller,
      sender: req.user._id,
      type: 'new_offer',
      title: 'New Offer Received!',
      message: `${req.user.name} made an ${offerType === 'Item Exchange' ? 'exchange proposal' : 'offer of ₹' + offeredPrice} for "${listing.title}"`,
      link: `/dashboard?tab=offers`
    });

    const populatedOffer = await Offer.findById(offer._id)
      .populate('buyer', 'name avatar campusHostelOrBlock')
      .populate('seller', 'name avatar')
      .populate('listing', 'title price images status');

    res.status(201).json({
      success: true,
      offer: populatedOffer,
      message: 'Offer submitted successfully to the seller!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's offers (sent or received)
// @route   GET /api/offers
// @access  Private
const getOffers = async (req, res, next) => {
  try {
    const { role } = req.query; // 'buyer' or 'seller' or all
    const query = {};

    if (role === 'buyer') {
      query.buyer = req.user._id;
    } else if (role === 'seller') {
      query.seller = req.user._id;
    } else {
      query.$or = [{ buyer: req.user._id }, { seller: req.user._id }];
    }

    const offers = await Offer.find(query)
      .populate('buyer', 'name avatar campusHostelOrBlock ratingAverage')
      .populate('seller', 'name avatar campusHostelOrBlock ratingAverage')
      .populate('listing', 'title price images status pickupLocation')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: offers.length,
      offers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to an offer (Accept, Reject, Counter)
// @route   PUT /api/offers/:id/respond
// @access  Private
const respondToOffer = async (req, res, next) => {
  try {
    const { action, counterPrice, counterMessage } = req.body;
    // action: 'accept', 'reject', 'counter'
    const offer = await Offer.findById(req.params.id)
      .populate('listing', 'title seller')
      .populate('buyer', 'name')
      .populate('seller', 'name');

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Only seller can accept, reject, or counter a pending offer
    if (offer.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the listing seller can respond to this offer' });
    }

    if (action === 'accept') {
      offer.status = 'Accepted';
      await offer.save();

      // Notify buyer
      await Notification.create({
        recipient: offer.buyer._id,
        sender: req.user._id,
        type: 'offer_accepted',
        title: 'Offer Accepted! 🎉',
        message: `${req.user.name} accepted your offer on "${offer.listing.title}". You can now proceed to reserve and coordinate pickup.`,
        link: `/listings/${offer.listing._id}`
      });
    } else if (action === 'reject') {
      offer.status = 'Rejected';
      await offer.save();

      // Notify buyer
      await Notification.create({
        recipient: offer.buyer._id,
        sender: req.user._id,
        type: 'offer_rejected',
        title: 'Offer Declined',
        message: `${req.user.name} declined your offer on "${offer.listing.title}".`,
        link: `/listings/${offer.listing._id}`
      });
    } else if (action === 'counter') {
      if (!counterPrice || Number(counterPrice) <= 0) {
        return res.status(400).json({ message: 'Please enter a valid counter offer price' });
      }
      offer.status = 'Countered';
      offer.counterPrice = Number(counterPrice);
      offer.counterMessage = counterMessage || '';
      await offer.save();

      // Notify buyer
      await Notification.create({
        recipient: offer.buyer._id,
        sender: req.user._id,
        type: 'offer_countered',
        title: 'Counter Offer Received',
        message: `${req.user.name} sent a counter offer of ₹${counterPrice} on "${offer.listing.title}".`,
        link: `/dashboard?tab=offers`
      });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({
      success: true,
      offer,
      message: `Offer ${offer.status.toLowerCase()} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Buyer responds to a counter offer
// @route   PUT /api/offers/:id/counter-response
// @access  Private
const respondToCounter = async (req, res, next) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const offer = await Offer.findById(req.params.id)
      .populate('listing', 'title')
      .populate('seller', 'name');

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the buyer can respond to this counter offer' });
    }

    if (offer.status !== 'Countered') {
      return res.status(400).json({ message: 'This offer is not in Countered status' });
    }

    if (action === 'accept') {
      offer.status = 'Accepted';
      offer.offeredPrice = offer.counterPrice; // adopt counter price
      await offer.save();

      await Notification.create({
        recipient: offer.seller._id,
        sender: req.user._id,
        type: 'offer_accepted',
        title: 'Counter Offer Accepted! 🎉',
        message: `${req.user.name} accepted your counter offer of ₹${offer.counterPrice} on "${offer.listing.title}".`,
        link: `/dashboard?tab=offers`
      });
    } else {
      offer.status = 'Rejected';
      await offer.save();
    }

    res.json({
      success: true,
      offer,
      message: `Counter offer ${offer.status.toLowerCase()} successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOffer,
  getOffers,
  respondToOffer,
  respondToCounter
};

