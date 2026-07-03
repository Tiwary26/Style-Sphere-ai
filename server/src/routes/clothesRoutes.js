const express = require('express');
const router = express.Router();
const {
  getClothes,
  getClothe,
  createClothe,
  updateClothe,
  deleteClothe,
  toggleFavorite,
  toggleArchive,
} = require('../controllers/clothesController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.use(protect); // Secure all clothes routes

router.route('/')
  .get(getClothes)
  .post(upload.array('images', 5), createClothe);

router.route('/:id')
  .get(getClothe)
  .put(upload.array('images', 5), updateClothe)
  .delete(deleteClothe);

router.post('/:id/toggle-favorite', toggleFavorite);
router.post('/:id/toggle-archive', toggleArchive);

module.exports = router;
