const User = require('../models/User');
const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const Offer = require('../models/Offer');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Report = require('../models/Report');

const runSeed = async () => {
  console.log('Seeding campus users...');
  // Create admin & student accounts
  const adminUser = await User.create({
    name: 'Campus Admin',
    email: 'admin@campus.edu',
    password: 'password123',
    role: 'admin',
    isVerified: true,
    campusHostelOrBlock: 'Administrative Building',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Official campus sustainability and reuse platform administrator.',
    ratingAverage: 5.0,
    ratingCount: 12
  });

  const studentA = await User.create({
    name: 'Aarav Sharma',
    email: 'aarav@campus.edu',
    password: 'password123',
    role: 'student',
    isVerified: true,
    campusHostelOrBlock: 'Hostel 7, Room 304',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    bio: '3rd year Computer Science major. Selling pre-loved tech, textbooks, and hostel essentials before graduating.',
    phone: '+91 98765 43210',
    ratingAverage: 4.9,
    ratingCount: 8
  });

  const studentB = await User.create({
    name: 'Priya Patel',
    email: 'priya@campus.edu',
    password: 'password123',
    role: 'student',
    isVerified: true,
    campusHostelOrBlock: 'Hostel 4, Wing B',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    bio: '2nd year Electronics student. Passionate about zero-waste campus living. Always open to fair exchanges!',
    phone: '+91 91234 56789',
    ratingAverage: 4.8,
    ratingCount: 5
  });

  const studentC = await User.create({
    name: 'Rohan Verma',
    email: 'rohan@campus.edu',
    password: 'password123',
    role: 'student',
    isVerified: true,
    campusHostelOrBlock: 'Hostel 12, Floor 2',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Final year Mech student. Clearing out cycling gear and lab materials.',
    ratingAverage: 4.7,
    ratingCount: 4
  });

  console.log('Seeding campus listings with realistic INR prices...');
  const listings = [
    {
      title: 'Casio fx-991EX Classwiz Scientific Calculator',
      description: 'Advanced non-programmable engineering calculator with high-resolution LCD display and QR code function. Works perfectly, battery replaced last semester. Essential for all core math and physics exams.',
      category: 'Electronics',
      listingType: 'For Sale',
      price: 950,
      condition: 'Like New',
      pickupLocation: 'Central Library Lawn or Hostel 7 Desk',
      seller: studentA._id,
      images: [
        'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=700&q=80',
        'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=700&q=80'
      ],
      status: 'Available',
      viewsCount: 42
    },
    {
      title: 'B.Tech Engineering Mathematics (B.S. Grewal 44th Edition)',
      description: 'Comprehensive Higher Engineering Mathematics textbook with highlighted formulas and solved question papers for Semester 1 & 2. Cover is intact with protective lamination.',
      category: 'Books & Notes',
      listingType: 'For Sale',
      price: 350,
      condition: 'Gently Used',
      pickupLocation: 'Student Activity Center (SAC)',
      seller: studentA._id,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80'
      ],
      status: 'Available',
      viewsCount: 29
    },
    {
      title: 'Hero Sprint Campus Bicycle (18-Speed)',
      description: 'Reliable single-rider campus cycle with front basket, sturdy kickstand, and combination cable lock included. Tires recently inflated. Perfect for rushing between hostel and lecture halls.',
      category: 'Sports Equipment',
      listingType: 'For Sale',
      price: 2800,
      condition: 'Gently Used',
      pickupLocation: 'Hostel 12 Cycle Stand',
      seller: studentC._id,
      images: [
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=700&q=80'
      ],
      status: 'Available',
      viewsCount: 68
    },
    {
      title: 'Ergonomic Mesh Study Chair with Lumbar Support',
      description: 'Breathable high-back mesh chair with adjustable armrests and smooth nylon casters. Bought during 2nd year; super comfortable for late-night coding and exam cram sessions.',
      category: 'Furniture',
      listingType: 'For Sale',
      price: 1800,
      condition: 'Like New',
      pickupLocation: 'Hostel 4 Ground Floor Common Area',
      seller: studentB._id,
      images: [
        'https://images.unsplash.com/photo-1580481077195-c3a82da91883?auto=format&fit=crop&w=700&q=80'
      ],
      status: 'Available',
      viewsCount: 51
    },
    {
      title: 'Logitech Wireless Keyboard & Silent Mouse Combo (MK270)',
      description: '2.4 GHz USB wireless receiver included. Keys are responsive and silent. Mouse has new Duracell battery. Great for laptop setups or external monitors.',
      category: 'Electronics',
      listingType: 'Exchange',
      price: 0,
      exchangePreferences: 'Willing to exchange for an adjustable laptop riser stand or HDMI to USB-C hub',
      condition: 'Like New',
      pickupLocation: 'Computer Science Department Foyer',
      seller: studentB._id,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80'
      ],
      status: 'Available',
      viewsCount: 37
    },
    {
      title: 'Minimalist Dimmable LED Desk Study Lamp with USB Port',
      description: '3 color temperatures (warm, cool, neutral) with 5 brightness levels. Flexible gooseneck arm and integrated phone charging port on base. No flickering.',
      category: 'Hostel Essentials',
      listingType: 'For Sale',
      price: 490,
      condition: 'Like New',
      pickupLocation: 'Hostel 7 Reception',
      seller: studentA._id,
      images: [
        'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=700&q=80'
      ],
      status: 'Available',
      viewsCount: 34
    },
    {
      title: 'Chemistry / Biology Laboratory White Coat (Size M)',
      description: 'Clean 100% cotton knee-length white lab coat with 3 front pockets. Worn only during 1st-year chemistry practicals. Freshly laundered and ironed.',
      category: 'Clothing',
      listingType: 'Free Donation',
      price: 0,
      condition: 'Gently Used',
      pickupLocation: 'Chemistry Dept Entrance Gate',
      seller: studentB._id,
      images: [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80'
      ],
      status: 'Available',
      viewsCount: 45
    },
    {
      title: 'Handwritten Data Structures & Algorithms Exam Notes (Complete)',
      description: 'Bound spiral notebook containing clear visual tree traversals, dynamic programming formulas, graph algorithms, and Big-O complexity cheat sheets. Scored 10/10 in midterms with these.',
      category: 'Books & Notes',
      listingType: 'Free Donation',
      price: 0,
      condition: 'Gently Used',
      pickupLocation: 'Central Library Discussion Room 3',
      seller: studentA._id,
      images: [
        'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80'
      ],
      status: 'Available',
      viewsCount: 92
    },
    {
      title: 'Yonex Muscle Power 29 Badminton Racquet with Cover',
      description: 'Even-balance carbon graphite badminton racquet strung at 24 lbs. Grip is newly replaced. Includes insulated Yonex head cover and 2 plastic shuttles.',
      category: 'Sports Equipment',
      listingType: 'For Sale',
      price: 1100,
      condition: 'Like New',
      pickupLocation: 'Campus Sports Complex / Badminton Courts',
      seller: studentC._id,
      images: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=700&q=80'
      ],
      status: 'Available',
      viewsCount: 39
    },
    {
      title: 'Stainless Steel Electric Kettle 1.5L for Hostel Rooms',
      description: 'Fast boiling 1500W electric kettle with auto-shutoff and boil-dry protection. Clean interior with no limescale. Life-saver for late night noodles and coffee.',
      category: 'Hostel Essentials',
      listingType: 'For Sale',
      price: 450,
      condition: 'Gently Used',
      pickupLocation: 'Hostel 4 Canteen',
      seller: studentB._id,
      images: [
        'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=700&q=80'
      ],
      status: 'Available',
      viewsCount: 63
    },
    {
      title: 'Engineering Mini Drafter & Set Square Instrument Box',
      description: 'Standard technical drawing mini drafter with clamp, scales, and acrylic set squares. Essential for Engineering Graphics course.',
      category: 'Stationery',
      listingType: 'For Sale',
      price: 250,
      condition: 'Gently Used',
      pickupLocation: 'Drawing Hall B / Mechanical Block',
      seller: studentC._id,
      images: [
        'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=700&q=80'
      ],
      status: 'Available',
      viewsCount: 22
    },
    {
      title: 'Refurbished Lenovo ThinkPad T480 (Core i5, 16GB, 256GB SSD)',
      description: 'Legendary durable ThinkPad with backlit keyboard, dual batteries, and original 65W USB-C charger. Battery health is 84%. Clean Ubuntu 24.04 LTS installed.',
      category: 'Electronics',
      listingType: 'For Sale',
      price: 19500,
      condition: 'Gently Used',
      pickupLocation: 'Main Innovation Hub / Coffee Shack',
      seller: studentA._id,
      images: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=700&q=80'
      ],
      status: 'Available',
      viewsCount: 110
    }
  ];

  await Listing.insertMany(listings);

  // Completed exchange history
  const completedListing = await Listing.create({
    title: 'Operating Systems Concepts (Silberschatz Dinosaur Book 9th Ed)',
    description: 'Standard textbook for CS OS coursework. Well kept.',
    category: 'Books & Notes',
    listingType: 'For Sale',
    price: 400,
    condition: 'Gently Used',
    pickupLocation: 'Library Ground Floor',
    seller: studentA._id,
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=700&q=80'],
    status: 'Sold',
    viewsCount: 75
  });

  const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const completedReservation = await Reservation.create({
    listing: completedListing._id,
    buyer: studentB._id,
    seller: studentA._id,
    status: 'Completed',
    pickupTime: pastDate,
    pickupLocation: 'Library Ground Floor',
    expiresAt: new Date(pastDate.getTime() + 48 * 60 * 60 * 1000),
    handoverCode: 'VERIFIED_PAST',
    handoverCodeVerified: true,
    handoverCompletedAt: pastDate
  });

  await Review.create({
    reservation: completedReservation._id,
    listing: completedListing._id,
    reviewer: studentB._id,
    reviewee: studentA._id,
    rating: 5,
    comment: 'Super smooth campus handover! Aarav reached right on time at the library and the book is in immaculate condition. Highly recommended seller!'
  });

  await Notification.create({
    recipient: studentA._id,
    sender: studentB._id,
    type: 'handover_completed',
    title: 'Handover Completed! 🎉',
    message: 'Exchange for Operating Systems Concepts was completed successfully.',
    link: '/dashboard?tab=reservations'
  });

  console.log('Seeding finished successfully.');
};

module.exports = runSeed;

