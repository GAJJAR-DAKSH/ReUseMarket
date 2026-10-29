const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offerType: {
    type: String,
    enum: ['Price Offer', 'Item Exchange'],
    default: 'Price Offer'
  },
  offeredPrice: {
    type: Number,
    min: [0, 'Offered price cannot be negative'],
    default: 0
  },
  exchangeItemDescription: {
    type: String,
    trim: true,
    default: ''
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters'],
    default: ''
  },
  counterPrice: {
    type: Number,
    min: 0,
    default: null
  },
  counterMessage: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Countered', 'Completed', 'Withdrawn'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

offerSchema.index({ listing: 1, buyer: 1 });
offerSchema.index({ seller: 1, status: 1 });
offerSchema.index({ buyer: 1, status: 1 });

module.exports = mongoose.model('Offer', offerSchema);

