const express = require('express');
const router = express.Router();
const {
  createReview,
  getUserReviews,
  reportReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/user/:id', getUserReviews);
router.post('/', protect, createReview);
router.post('/:id/report', protect, reportReview);

module.exports = router;

