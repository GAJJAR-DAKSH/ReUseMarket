const Report = require('../models/Report');
const Listing = require('../models/Listing');

// @desc    Submit a moderation report for a listing, user, or review
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const { listingId, userId, reviewId, reason, details } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }

    if (!listingId && !userId && !reviewId) {
      return res.status(400).json({ message: 'Must report a listing, student user, or review' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedListing: listingId || null,
      reportedUser: userId || null,
      reportedReview: reviewId || null,
      reason,
      details: details || '',
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      report,
      message: 'Report submitted for campus moderation review. Thank you for keeping our community safe.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport
};

