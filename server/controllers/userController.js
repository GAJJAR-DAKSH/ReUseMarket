const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');

// @desc    Get public user profile with listings & reviews
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const activeListings = await Listing.find({
      seller: user._id,
      status: { $in: ['Available', 'Reserved'] }
    }).sort({ createdAt: -1 });

    const reviews = await Review.find({ reviewee: user._id })
      .populate('reviewer', 'name avatar campusHostelOrBlock')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      activeListings,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, bio, phone, campusHostelOrBlock, avatar } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (campusHostelOrBlock) user.campusHostelOrBlock = campusHostelOrBlock;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        campusHostelOrBlock: updatedUser.campusHostelOrBlock,
        ratingAverage: updatedUser.ratingAverage,
        ratingCount: updatedUser.ratingCount,
        savedListings: updatedUser.savedListings
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle saving a listing
// @route   POST /api/users/save-listing/:id
// @access  Private
const toggleSaveListing = async (req, res, next) => {
  try {
    const listingId = req.params.id;
    const user = await User.findById(req.user._id);

    const isSaved = user.savedListings.some(id => id.toString() === listingId);

    if (isSaved) {
      user.savedListings = user.savedListings.filter(id => id.toString() !== listingId);
    } else {
      user.savedListings.push(listingId);
    }

    await user.save();

    res.json({
      success: true,
      saved: !isSaved,
      savedListings: user.savedListings,
      message: !isSaved ? 'Listing saved to favorites' : 'Listing removed from favorites'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved listings
// @route   GET /api/users/saved-listings
// @access  Private
const getSavedListings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedListings',
      populate: { path: 'seller', select: 'name avatar campusHostelOrBlock isVerified' }
    });

    res.json({
      success: true,
      savedListings: user.savedListings || []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  toggleSaveListing,
  getSavedListings
};

