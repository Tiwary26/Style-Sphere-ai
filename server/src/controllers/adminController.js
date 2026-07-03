const User = require('../models/User');
const Clothe = require('../models/Clothe');
const Outfit = require('../models/Outfit');
const Post = require('../models/Post');

// Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Clean up user's data
    await Clothe.deleteMany({ user: req.params.id });
    await Outfit.deleteMany({ user: req.params.id });
    await Post.deleteMany({ user: req.params.id });

    res.status(200).json({ success: true, message: 'User and all related records deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get administrative statistics (admin only)
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClothes = await Clothe.countDocuments();
    const totalOutfits = await Outfit.countDocuments();
    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalClothes,
        totalOutfits,
        totalPosts,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
