const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const runSeed = require('./utils/seedData');
const Listing = require('./models/Listing');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const offerRoutes = require('./routes/offerRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const handoverRoutes = require('./routes/handoverRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Initialize app
const app = express();

// Connect to Database & Auto-Seed if empty
connectDB().then(async () => {
  try {
    const count = await Listing.countDocuments();
    if (count === 0) {
      console.log('Database empty: auto-seeding sample campus listings...');
      await runSeed();
    }
  } catch (err) {
    console.error('Auto-seed check note:', err.message);
  }
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Access from this origin is not permitted'));
  },
  credentials: true
}));

// Body parsing with safe size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ReUseMarket Campus API'
  });
});

// Seed API endpoint for instant re-seeding
app.post('/api/seed', async (req, res) => {
  try {
    const User = require('./models/User');
    const Reservation = require('./models/Reservation');
    const Offer = require('./models/Offer');
    const Review = require('./models/Review');
    const Notification = require('./models/Notification');
    const Report = require('./models/Report');

    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      Reservation.deleteMany({}),
      Offer.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
      Report.deleteMany({})
    ]);

    await runSeed();

    res.json({
      success: true,
      message: 'Database freshly seeded with campus demo data!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/handover', handoverRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(` ReUseMarket API Server running on http://localhost:${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(` College Email Domain: ${process.env.ALLOWED_COLLEGE_EMAIL_DOMAIN || '.edu, .ac.in'}`);
  console.log(`=============================================================\n`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});
