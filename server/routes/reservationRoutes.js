const express = require('express');
const router = express.Router();
const {
  createReservation,
  getReservations,
  getReservationById,
  cancelReservation
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createReservation)
  .get(getReservations);

router.route('/:id')
  .get(getReservationById);

router.put('/:id/cancel', cancelReservation);

module.exports = router;

