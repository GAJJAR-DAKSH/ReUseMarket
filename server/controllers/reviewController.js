const Review = require('../models/Review');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Submit a review after verified completed exchange
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { reservationId, rating, comment } = req.body;

    if (!reservationId || !rating || !comment) {
      return res.status(400).json({ message: 'Reservation ID, star rating (1-5), and review comment are required' });
    }

    const reservation = await Reservation.findById(reservationId)
      .populate('listing', 'title')
      .populate('buyer', 'name')
      .populate('seller', 'name');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status !== 'Completed') {
      return res.status(400).json({
        message: 'Reviews can only be submitted after the physical in-person handover has been verified and completed.'
      });
    }

    const isBuyer = reservation.buyer._id.toString() === req.user._id.toString();
    const isSeller = reservation.seller._id.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'You were not a party to this exchange.' });
    }

    // Determine who is being reviewed
    const revieweeId = isBuyer ? reservation.seller._id : reservation.buyer._id;

    // Check if user already reviewed this exchange
    const existingReview = await Review.findOne({
      reservation: reservationId,
      reviewer: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already submitted a review for this exchange.' });
    }

    const review = await Review.create({
      reservation: reservationId,
      listing: reservation.listing._id,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating: Math.max(1, Math.min(5, Number(rating))),
      comment
    });

    // Recalculate reviewee's average rating
    const allUserReviews = await Review.find({ reviewee: revieweeId });
    const totalScore = allUserReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgScore = Number((totalScore / allUserReviews.length).toFixed(1));

    await User.findByIdAndUpdate(revieweeId, {
      ratingAverage: avgScore,
      ratingCount: allUserReviews.length
    });

    // Notify reviewee
    await Notification.create({
      recipient: revieweeId,
      sender: req.user._id,
      type: 'new_review',
      title: 'New Campus Review! ⭐',
      message: `${req.user.name} gave you a ${rating}-star review for the exchange of "${reservation.listing.title}"`,
      link: `/users/${revieweeId}`
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name avatar campusHostelOrBlock')
      .populate('listing', 'title');

    res.status(201).json({
      success: true,
      review: populatedReview,
      message: 'Review submitted successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a specific user
// @route   GET /api/reviews/user/:id
// @access  Public
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name avatar campusHostelOrBlock')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report an abusive review
// @route   POST /api/reviews/:id/report
// @access  Private
const reportReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isReported = true;
    await review.save();

    res.json({
      success: true,
      message: 'Review has been flagged for campus moderation.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getUserReviews,
  reportReview
};

