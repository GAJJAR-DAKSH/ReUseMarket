const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const Offer = require('../models/Offer');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const runSeed = require('./seedData');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database records...');
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

    console.log('\n=============================================================');
    console.log(' DATABASE SEEDED SUCCESSFULLY WITH REALISTIC CAMPUS DATA!');
    console.log('=============================================================');
    console.log('Demo Credentials:');
    console.log('  Admin:   admin@campus.edu   | Password: password123');
    console.log('  Student: aarav@campus.edu   | Password: password123');
    console.log('  Student: priya@campus.edu   | Password: password123');
    console.log('  Student: rohan@campus.edu   | Password: password123');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
