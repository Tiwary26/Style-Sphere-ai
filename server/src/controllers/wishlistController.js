const Wishlist = require('../models/Wishlist');

// Get all wishlist items for a user
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: wishlist.length, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add item to wishlist
exports.createWishlist = async (req, res) => {
  try {
    const { name, category, price, imageUrl, websiteUrl } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Please provide name and category' });
    }

    const item = await Wishlist.create({
      user: req.user.id,
      name,
      category,
      price: price ? Number(price) : 0,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300',
      websiteUrl: websiteUrl || '',
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update wishlist item (e.g. mark as Purchased)
exports.updateWishlist = async (req, res) => {
  try {
    let item = await Wishlist.findOne({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }

    item = await Wishlist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete wishlist item
exports.deleteWishlist = async (req, res) => {
  try {
    const item = await Wishlist.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }

    res.status(200).json({ success: true, message: 'Wishlist item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
