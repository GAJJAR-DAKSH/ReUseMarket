const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Listing title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Books & Notes',
      'Electronics',
      'Hostel Essentials',
      'Furniture',
      'Clothing',
      'Stationery',
      'Sports Equipment',
      'Other'
    ]
  },
  listingType: {
    type: String,
    required: [true, 'Listing type is required'],
    enum: ['For Sale', 'Free Donation', 'Exchange'],
    default: 'For Sale'
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['Brand New', 'Like New', 'Gently Used', 'Fair', 'Heavily Used'],
    default: 'Gently Used'
  },
  images: [{
    type: String
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exchangePreferences: {
    type: String,
    trim: true,
    default: ''
  },
  pickupLocation: {
    type: String,
    required: [true, 'Campus pickup location is required'],
    trim: true,
    default: 'Campus Library / Student Center'
  },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Sold', 'Completed', 'Archived'],
    default: 'Available'
  },
  activeReservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    default: null
  },
  viewsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Text indexing for fast campus search across title and description
listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ category: 1, listingType: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Listing', listingSchema);

