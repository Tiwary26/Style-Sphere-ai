const Outfit = require('../models/Outfit');
const Clothe = require('../models/Clothe');
const { getWeatherData } = require('../services/weatherService');
const { recommendOutfit } = require('../services/aiAssistant');

// Get all outfits
exports.getOutfits = async (req, res) => {
  try {
    const outfits = await Outfit.find({ user: req.user.id })
      .populate('clothes')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: outfits.length,
      data: outfits,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single outfit
exports.getOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, user: req.user.id }).populate('clothes');

    if (!outfit) {
      return res.status(404).json({ success: false, message: 'Outfit not found' });
    }

    res.status(200).json({ success: true, data: outfit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new outfit
exports.createOutfit = async (req, res) => {
  try {
    const { name, clothes, season, occasion, mood, imageUrl } = req.body;

    if (!clothes || !Array.isArray(clothes) || clothes.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide a list of clothing items' });
    }

    // Verify all clothes belong to the user
    const userClothes = await Clothe.find({ _id: { $in: clothes }, user: req.user.id });
    if (userClothes.length !== clothes.length) {
      return res.status(400).json({ success: false, message: 'Some clothing items are invalid or not yours' });
    }

    const outfit = await Outfit.create({
      user: req.user.id,
      name,
      clothes,
      season: season || 'All-Season',
      occasion: occasion || 'Casual',
      mood: mood || 'Neutral',
      imageUrl: imageUrl || userClothes[0].imageUrls[0], // Fallback to first item image
    });

    res.status(201).json({ success: true, data: outfit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update outfit
exports.updateOutfit = async (req, res) => {
  try {
    let outfit = await Outfit.findOne({ _id: req.params.id, user: req.user.id });

    if (!outfit) {
      return res.status(404).json({ success: false, message: 'Outfit not found' });
    }

    outfit = await Outfit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('clothes');

    res.status(200).json({ success: true, data: outfit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete outfit
exports.deleteOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!outfit) {
      return res.status(404).json({ success: false, message: 'Outfit not found' });
    }

    res.status(200).json({ success: true, message: 'Outfit deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Outfit Roulette Endpoint (Weather + Occasion + Mood outfit generator)
exports.outfitRoulette = async (req, res) => {
  try {
    const { lat, lon, city, occasion, mood, season } = req.body;

    // 1. Fetch weather
    const weather = await getWeatherData(lat, lon, city);

    // 2. Fetch all user's clothes
    const clothes = await Clothe.find({ user: req.user.id, isArchived: false });

    if (clothes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your wardrobe is empty! Please add clothes first to use Outfit Roulette.',
      });
    }

    // 3. Call AI assistant recommendations
    const recommendation = await recommendOutfit(
      clothes,
      weather,
      occasion || 'Casual',
      mood || 'Happy',
      season || weather.recommendations.recommendedSeason
    );

    // 4. Retrieve complete clothing documents for recommendation
    const recommendedClothes = await Clothe.find({
      _id: { $in: recommendation.outfitIds },
      user: req.user.id,
    });

    // Track wear stats (simulate wearing when roulette is triggered, or leave to user discretion)
    // Here we just return the full recommendation info
    res.status(200).json({
      success: true,
      weather,
      recommendation: {
        clothes: recommendedClothes,
        reasoning: recommendation.reasoning,
        colorAccessories: recommendation.colorAccessories,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record outfit wear (updates timesWorn and clothes timesWorn for Cost Per Wear analysis)
exports.recordWear = async (req, res) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, user: req.user.id });
    if (!outfit) {
      return res.status(404).json({ success: false, message: 'Outfit not found' });
    }

    // Increment outfit count
    outfit.timesWorn += 1;
    await outfit.save();

    // Increment individual clothes count
    await Clothe.updateMany(
      { _id: { $in: outfit.clothes }, user: req.user.id },
      { $inc: { timesWorn: 1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Outfit wear logged. Closet Analytics updated.',
      timesWorn: outfit.timesWorn,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
