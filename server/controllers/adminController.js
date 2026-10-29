const User = require('../models/User');
const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

// @desc    Admin dashboard summary overview metrics
// @route   GET /api/admin/overview
// @access  Private/Admin
const getAdminOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'Available' });
    const reservedListings = await Listing.countDocuments({ status: 'Reserved' });
    const soldListings = await Listing.countDocuments({ status: 'Sold' });
    const donatedListings = await Listing.countDocuments({ listingType: 'Free Donation', status: 'Completed' });

    const totalReservations = await Reservation.countDocuments();
    const completedExchanges = await Reservation.countDocuments({ status: 'Completed' });

    const pendingReports = await Report.countDocuments({ status: 'Pending' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        totalListings,
        activeListings,
        reservedListings,
        soldListings,
        donatedListings,
        totalReservations,
        completedExchanges,
        pendingReports
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users list for admin management
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { search, role, isVerified, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (isVerified !== undefined && isVerified !== 'All') {
      query.isVerified = isVerified === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { campusHostelOrBlock: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -verificationToken -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status / role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { isVerified, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isVerified !== undefined) user.isVerified = isVerified;
    if (role && ['student', 'admin'].includes(role)) user.role = role;

    await user.save();

    res.json({
      success: true,
      user,
      message: 'User updated successfully by admin'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get moderation reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = async (req, res, next) => {
  try {
    const { status = 'All' } = req.query;
    const query = {};
    if (status !== 'All') query.status = status;

    const reports = await Report.find(query)
      .populate('reporter', 'name email avatar')
      .populate({
        path: 'reportedListing',
        populate: { path: 'seller', select: 'name email avatar' }
      })
      .populate('reportedUser', 'name email avatar')
      .populate('reportedReview')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve or dismiss a moderation report
// @route   PUT /api/admin/reports/:id
// @access  Private/Admin
const resolveReport = async (req, res, next) => {
  try {
    const { status, resolutionNotes, removeListing } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status || 'Resolved';
    report.resolutionNotes = resolutionNotes || '';
    report.resolvedBy = req.user._id;
    await report.save();

    // If admin requested removal of the reported listing
    if (removeListing && report.reportedListing) {
      await Listing.findByIdAndUpdate(report.reportedListing, {
        status: 'Archived'
      });
    }

    res.json({
      success: true,
      report,
      message: `Report marked as ${report.status.toLowerCase()}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin direct remove/archive listing
// @route   DELETE /api/admin/listings/:id
// @access  Private/Admin
const adminDeleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Listing removed by administrator'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminOverview,
  getUsers,
  updateUserStatus,
  getReports,
  resolveReport,
  adminDeleteListing
};

