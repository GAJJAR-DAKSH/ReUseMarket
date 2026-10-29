const express = require('express');
const router = express.Router();
const {
  getAdminOverview,
  getUsers,
  updateUserStatus,
  getReports,
  resolveReport,
  adminDeleteListing
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, admin);

router.get('/overview', getAdminOverview);
router.get('/users', getUsers);
router.put('/users/:id', updateUserStatus);
router.get('/reports', getReports);
router.put('/reports/:id', resolveReport);
router.delete('/listings/:id', adminDeleteListing);

module.exports = router;

