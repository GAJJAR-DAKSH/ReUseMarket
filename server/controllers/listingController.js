const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');

// @desc    Get all listings with filtering, search, sorting & pagination
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res, next) => {
  try {
    const {
      search,
      category,
      listingType,
      condition,
      status,
      minPrice,
      maxPrice,
      sort,
      seller,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Filter by status (default to Available if not explicitly asking for all or a specific status)
    if (status && status !== 'All') {
      query.status = status;
    } else if (!status && !seller) {
      query.status = 'Available';
    }

    // Filter by seller (e.g. for user's own listings in dashboard)
    if (seller) {
      query.seller = seller;
      // If fetching by seller, show all unless status specified
      if (!status) delete query.status;
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Listing type filter (For Sale, Free Donation, Exchange)
    if (listingType && listingType !== 'All') {
      query.listingType = listingType;
    }

    // Condition filter
    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
      // Remove empty price filter
      if (Object.keys(query.price).length === 0) delete query.price;
    }

    // Search query
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { exchangePreferences: { $regex: term, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'popular') {
      sortOption = { viewsCount: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .populate('seller', 'name avatar campusHostelOrBlock isVerified ratingAverage ratingCount')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: listings.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      listings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single listing by ID
// @route   GET /api/listings/:id
// @access  Public (optional auth)
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name avatar email phone campusHostelOrBlock isVerified ratingAverage ratingCount createdAt')
      .populate({
        path: 'activeReservation',
        select: 'status pickupTime pickupLocation buyer expiresAt'
      });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Increment view count asynchronously
    Listing.findByIdAndUpdate(listing._id, { $inc: { viewsCount: 1 } }).exec();

    // Related listings in the same category
    const relatedListings = await Listing.find({
      category: listing.category,
      _id: { $ne: listing._id },
      status: 'Available'
    })
      .limit(4)
      .populate('seller', 'name avatar campusHostelOrBlock isVerified');

    res.json({
      success: true,
      listing,
      relatedListings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      listingType,
      price,
      condition,
      images,
      exchangePreferences,
      pickupLocation
    } = req.body;

    if (!title || !description || !category || !condition || !pickupLocation) {
      return res.status(400).json({ message: 'Please provide all mandatory fields' });
    }

    // For Sale requires a price
    let finalPrice = Number(price) || 0;
    if (listingType === 'Free Donation') {
      finalPrice = 0;
    }

    const listing = await Listing.create({
      title,
      description,
      category,
      listingType: listingType || 'For Sale',
      price: finalPrice,
      condition,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'],
      seller: req.user._id,
      exchangePreferences: exchangePreferences || '',
      pickupLocation,
      status: 'Available'
    });

    const populatedListing = await Listing.findById(listing._id)
      .populate('seller', 'name avatar campusHostelOrBlock isVerified ratingAverage ratingCount');

    res.status(201).json({
      success: true,
      listing: populatedListing,
      message: 'Item listed successfully on ReUseMarket!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Make sure user is listing owner or admin
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this listing' });
    }

    const {
      title,
      description,
      category,
      listingType,
      price,
      condition,
      images,
      exchangePreferences,
      pickupLocation,
      status
    } = req.body;

    if (title) listing.title = title;
    if (description) listing.description = description;
    if (category) listing.category = category;
    if (listingType) {
      listing.listingType = listingType;
      if (listingType === 'Free Donation') listing.price = 0;
    }
    if (price !== undefined && listing.listingType !== 'Free Donation') {
      listing.price = Number(price);
    }
    if (condition) listing.condition = condition;
    if (images) listing.images = images;
    if (exchangePreferences !== undefined) listing.exchangePreferences = exchangePreferences;
    if (pickupLocation) listing.pickupLocation = pickupLocation;
    if (status) listing.status = status;

    await listing.save();

    res.json({
      success: true,
      listing,
      message: 'Listing updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Make sure user is listing owner or admin
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this listing' });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Listing removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload listing images
// @route   POST /api/listings/upload
// @access  Private
const uploadListingImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    const urls = req.files.map(file => `/uploads/${file.filename}`);

    res.json({
      success: true,
      images: urls,
      message: `${urls.length} image(s) uploaded successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  uploadListingImages
};

