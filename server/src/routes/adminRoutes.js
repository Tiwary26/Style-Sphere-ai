const express = require('express');
const router = express.Router();
const {
  getUsers,
  deleteUser,
  getAdminStats,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect);
router.use(admin); // Apply admin validation on all routes

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getAdminStats);

module.exports = router;
