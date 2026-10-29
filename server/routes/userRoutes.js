const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  toggleSaveListing,
  getSavedListings
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/saved-listings', protect, getSavedListings);
router.post('/save-listing/:id', protect, toggleSaveListing);
router.put('/profile', protect, updateProfile);
router.get('/:id', getUserProfile);

module.exports = router;

