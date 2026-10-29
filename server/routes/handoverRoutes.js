const express = require('express');
const router = express.Router();
const { verifyHandover } = require('../controllers/handoverController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/verify', verifyHandover);

module.exports = router;

