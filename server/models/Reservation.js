const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Expired', 'Completed'],
    default: 'Confirmed'
  },
  pickupTime: {
    type: Date,
    required: true
  },
  pickupLocation: {
    type: String,
    required: true
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  expiresAt: {
    type: Date,
    required: true
  },
  // Secure 6-digit one-time handover verification code
  // Only the buyer gets to see this code. The seller inputs it into the system at meetup.
  handoverCode: {
    type: String,
    required: true,
    select: false // Do not expose by default in general queries
  },
  handoverCodeVerified: {
    type: Boolean,
    default: false
  },
  handoverCompletedAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

reservationSchema.index({ listing: 1, status: 1 });
reservationSchema.index({ buyer: 1, status: 1 });
reservationSchema.index({ seller: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);

