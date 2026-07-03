const express = require('express');
const router = express.Router();
const {
  getWishlist,
  createWishlist,
  updateWishlist,
  deleteWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect); // Secure all wishlist routes

router.route('/')
  .get(getWishlist)
  .post(createWishlist);

router.route('/:id')
  .put(updateWishlist)
  .delete(deleteWishlist);

module.exports = router;
