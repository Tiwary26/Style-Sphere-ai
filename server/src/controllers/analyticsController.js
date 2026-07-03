const Clothe = require('../models/Clothe');
const Outfit = require('../models/Outfit');
const Laundry = require('../models/Laundry');

// Get global user dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Core Metrics
    const totalClothes = await Clothe.countDocuments({ user: userId, isArchived: false });
    const favoriteClothes = await Clothe.countDocuments({ user: userId, isFavorite: true, isArchived: false });
    const dirtyClothes = await Clothe.countDocuments({ user: userId, laundryStatus: 'Dirty', isArchived: false });
    
    // Wardrobe Valuation
    const valuation = await Clothe.aggregate([
      { $match: { user: req.user._id, isArchived: false } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const wardrobeValue = valuation.length > 0 ? valuation[0].total : 0;

    // 2. Category Distribution
    const categoryStats = await Clothe.aggregate([
      { $match: { user: req.user._id, isArchived: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // 3. Color distribution
    const colorStats = await Clothe.aggregate([
      { $match: { user: req.user._id, isArchived: false } },
      { $group: { _id: '$color', count: { $sum: 1 } } }
    ]);

    // 4. Season Distribution
    const seasonStats = await Clothe.aggregate([
      { $match: { user: req.user._id, isArchived: false } },
      { $group: { _id: '$season', count: { $sum: 1 } } }
    ]);

    // 5. Cost Per Wear (Most Worn & Least Worn)
    const clothes = await Clothe.find({ user: userId, isArchived: false });
    const costPerWearList = clothes.map(c => ({
      id: c._id,
      name: c.name,
      category: c.category,
      price: c.price,
      timesWorn: c.timesWorn,
      costPerWear: c.costPerWear,
      imageUrl: c.imageUrls[0]
    }));

    // Sort by times worn desc for most used
    const mostUsed = [...costPerWearList]
      .filter(c => c.timesWorn > 0)
      .sort((a, b) => b.timesWorn - a.timesWorn)
      .slice(0, 5);

    // Sort by cost per wear desc for least cost-efficient
    const leastUsed = [...costPerWearList]
      .filter(c => c.timesWorn === 0 && c.price > 0)
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    // Today's Outfit suggestion (find a favorite outfit or last created outfit)
    const recentOutfit = await Outfit.findOne({ user: userId }).populate('clothes').sort('-createdAt');

    res.status(200).json({
      success: true,
      stats: {
        totalClothes,
        favoriteClothes,
        dirtyClothes,
        wardrobeValue,
        streak: req.user.streak,
        badgesCount: req.user.badges.length,
      },
      todayOutfit: recentOutfit || null,
      distributions: {
        categories: categoryStats,
        colors: colorStats,
        seasons: seasonStats,
      },
      costPerWear: {
        mostUsed,
        leastUsed,
        all: costPerWearList.sort((a, b) => a.costPerWear - b.costPerWear),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
