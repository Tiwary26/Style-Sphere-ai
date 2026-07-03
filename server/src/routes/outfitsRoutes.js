const express = require('express');
const router = express.Router();
const {
  getOutfits,
  getOutfit,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  outfitRoulette,
  recordWear,
} = require('../controllers/outfitsController');
const { protect } = require('../middleware/auth');

router.use(protect); // Secure all outfit routes

router.route('/')
  .get(getOutfits)
  .post(createOutfit);

router.post('/roulette', outfitRoulette);
router.post('/:id/wear', recordWear);

router.route('/:id')
  .get(getOutfit)
  .put(updateOutfit)
  .delete(deleteOutfit);

module.exports = router;
