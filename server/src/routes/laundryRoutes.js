const express = require('express');
const router = express.Router();
const {
  getLaundryQueue,
  updateLaundryStatus,
  addLaundryReminder,
} = require('../controllers/laundryController');
const { protect } = require('../middleware/auth');

router.use(protect); // Secure all laundry routes

router.route('/')
  .get(getLaundryQueue);

router.post('/update-status', updateLaundryStatus);
router.post('/add-reminder', addLaundryReminder);

module.exports = router;
