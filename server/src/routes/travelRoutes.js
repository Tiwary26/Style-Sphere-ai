const express = require('express');
const router = express.Router();
const {
  getTravelPlans,
  createTravelPlan,
  togglePackItem,
  deleteTravelPlan,
} = require('../controllers/travelController');
const { protect } = require('../middleware/auth');

router.use(protect); // Secure all travel routes

router.route('/')
  .get(getTravelPlans)
  .post(createTravelPlan);

router.route('/:id')
  .delete(deleteTravelPlan);

router.put('/:planId/item/:itemId/toggle-pack', togglePackItem);

module.exports = router;
