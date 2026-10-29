const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

// @desc    Get real-time database-driven campus sustainability & marketplace analytics
// @route   GET /api/analytics
// @access  Public
const getAnalytics = async (req, res, next) => {
  try {
    const totalListings = await Listing.countDocuments();
    const availableListings = await Listing.countDocuments({ status: 'Available' });
    const reservedListings = await Listing.countDocuments({ status: 'Reserved' });
    const completedListings = await Listing.countDocuments({ status: { $in: ['Sold', 'Completed'] } });

    // Completed handovers
    const completedExchanges = await Reservation.countDocuments({ status: 'Completed' });

    // Donated items (free donation completed)
    const itemsDonated = await Listing.countDocuments({
      listingType: 'Free Donation',
      status: { $in: ['Sold', 'Completed'] }
    });

    // Items Reused: either completed via reservation or marked sold/completed
    const itemsReused = Math.max(completedExchanges, completedListings);

    // Active campus users
    const activeUsers = await User.countDocuments();

    // Category distribution
    const categoryAgg = await Listing.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          completedCount: {
            $sum: {
              $cond: [{ $in: ['$status', ['Sold', 'Completed']] }, 1, 0]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly trends (past 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrends = await Reservation.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalReservations: { $sum: 1 },
          completedExchanges: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly trends
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrends = monthlyTrends.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      totalReservations: item.totalReservations,
      completedExchanges: item.completedExchanges
    }));

    // Environmental Impact Calculation & Transparent Assumptions
    // Source metrics based on university circular economy lifecycles:
    // 1. Avg CO2 saved per reused campus item: ~14.2 kg CO2 equivalent (EPA WARM & academic lifecycle analysis for books, electronics, hostel gear)
    // 2. Avg solid waste diverted per item: ~3.8 kg
    // 3. Avg student economic savings: ~₹650 per reused or donated item
    const kgCo2Saved = Math.round(itemsReused * 14.2);
    const kgWasteDiverted = Math.round(itemsReused * 3.8);
    const estimatedStudentSavingsInr = itemsReused * 650;

    res.json({
      success: true,
      stats: {
        totalListings,
        availableListings,
        reservedListings,
        completedExchanges: itemsReused,
        itemsDonated,
        itemsReused,
        activeUsers
      },
      environmentalImpact: {
        kgCo2Saved,
        kgWasteDiverted,
        treesEquivalent: Math.round(kgCo2Saved / 21.7), // 1 mature tree absorbs ~21.7 kg CO2/yr
        estimatedStudentSavingsInr,
        assumptions: [
          'Average 14.2 kg CO2e avoided per reused student essential (based on EPA WARM lifecycle models)',
          'Average 3.8 kg municipal/e-waste diverted from local campus landfills per exchange',
          'Average estimated ₹650 saved per transaction by purchasing second-hand versus new retail'
        ]
      },
      categoryDistribution: categoryAgg.map(cat => ({
        category: cat._id,
        count: cat.count,
        completedCount: cat.completedCount
      })),
      monthlyTrends: formattedTrends
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics
};

