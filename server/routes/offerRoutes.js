const express = require('express');
const router = express.Router();
const {
  createOffer,
  getOffers,
  respondToOffer,
  respondToCounter
} = require('../controllers/offerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createOffer)
  .get(getOffers);

router.put('/:id/respond', respondToOffer);
router.put('/:id/counter-response', respondToCounter);

module.exports = router;

