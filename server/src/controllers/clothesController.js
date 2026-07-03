const Clothe = require('../models/Clothe');
const User = require('../models/User');
const { uploadImage } = require('../config/cloudinary');

// Get all clothes for a user (with search, filter, pagination)
exports.getClothes = async (req, res) => {
  try {
    const queryObj = { user: req.user.id };

    // Filtering options
    if (req.query.category) queryObj.category = req.query.category;
    if (req.query.color) queryObj.color = new RegExp(req.query.color, 'i');
    if (req.query.season) queryObj.season = req.query.season;
    if (req.query.occasion) queryObj.occasion = req.query.occasion;
    if (req.query.laundryStatus) queryObj.laundryStatus = req.query.laundryStatus;
    
    // Favorite & Archived
    if (req.query.isFavorite) queryObj.isFavorite = req.query.isFavorite === 'true';
    if (req.query.isArchived) {
      queryObj.isArchived = req.query.isArchived === 'true';
    } else {
      queryObj.isArchived = false; // By default don't show archived
    }

    // Search query
    if (req.query.search) {
      queryObj.name = new RegExp(req.query.search, 'i');
    }

    // Execute query
    let query = Clothe.find(queryObj);

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const clothes = await query;

    res.status(200).json({
      success: true,
      count: clothes.length,
      data: clothes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single clothing item
exports.getClothe = async (req, res) => {
  try {
    const clothe = await Clothe.findOne({ _id: req.params.id, user: req.user.id });

    if (!clothe) {
      return res.status(404).json({ success: false, message: 'Clothing item not found' });
    }

    res.status(200).json({ success: true, data: clothe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new clothing item
exports.createClothe = async (req, res) => {
  try {
    const {
      name, category, color, brand, size, fabric,
      material, season, occasion, purchaseDate, price, notes
    } = req.body;

    let imageUrls = [];

    // Check for uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file);
        if (url) imageUrls.push(url);
      }
    } else if (req.file) {
      const url = await uploadImage(req.file);
      if (url) imageUrls.push(url);
    }

    // Default image if none uploaded
    if (imageUrls.length === 0) {
      imageUrls.push('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300');
    }

    // Build clothe
    const clothe = new Clothe({
      user: req.user.id,
      name,
      category,
      color,
      brand: brand || 'Unknown',
      size: size || 'M',
      fabric: fabric || 'Cotton',
      material: material || 'Standard',
      season: season || 'All-Season',
      occasion: occasion || 'Casual',
      purchaseDate,
      price: price ? Number(price) : 0,
      imageUrls,
      notes
    });

    // Generate QR code deep link
    clothe.qrCode = `stylesphere://clothe/${clothe._id}`;
    await clothe.save();

    // Check for badges
    const user = await User.findById(req.user.id);
    const count = await Clothe.countDocuments({ user: req.user.id });
    
    if (count === 1) {
      const earned = user.badges.some(b => b.name === 'First Steps');
      if (!earned) {
        user.badges.push({
          name: 'First Steps',
          description: 'Digitized your first wardrobe item',
          icon: 'wardrobe'
        });
        await user.save();
      }
    } else if (count >= 10) {
      const earned = user.badges.some(b => b.name === 'Closet Collector');
      if (!earned) {
        user.badges.push({
          name: 'Closet Collector',
          description: 'Digitized 10 wardrobe items',
          icon: 'archive'
        });
        await user.save();
      }
    }

    res.status(201).json({ success: true, data: clothe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update clothing item
exports.updateClothe = async (req, res) => {
  try {
    let clothe = await Clothe.findOne({ _id: req.params.id, user: req.user.id });

    if (!clothe) {
      return res.status(404).json({ success: false, message: 'Clothing item not found' });
    }

    // Update images if provided
    let imageUrls = clothe.imageUrls;
    if (req.files && req.files.length > 0) {
      imageUrls = [];
      for (const file of req.files) {
        const url = await uploadImage(file);
        if (url) imageUrls.push(url);
      }
    } else if (req.file) {
      imageUrls = [];
      const url = await uploadImage(req.file);
      if (url) imageUrls.push(url);
    }

    const updatedData = { ...req.body };
    if (req.files || req.file) {
      updatedData.imageUrls = imageUrls;
    }

    clothe = await Clothe.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: clothe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete clothing item
exports.deleteClothe = async (req, res) => {
  try {
    const clothe = await Clothe.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!clothe) {
      return res.status(404).json({ success: false, message: 'Clothing item not found' });
    }

    res.status(200).json({ success: true, message: 'Clothing item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const clothe = await Clothe.findOne({ _id: req.params.id, user: req.user.id });

    if (!clothe) {
      return res.status(404).json({ success: false, message: 'Clothing item not found' });
    }

    clothe.isFavorite = !clothe.isFavorite;
    await clothe.save();

    res.status(200).json({ success: true, data: clothe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle archive
exports.toggleArchive = async (req, res) => {
  try {
    const clothe = await Clothe.findOne({ _id: req.params.id, user: req.user.id });

    if (!clothe) {
      return res.status(404).json({ success: false, message: 'Clothing item not found' });
    }

    clothe.isArchived = !clothe.isArchived;
    await clothe.save();

    res.status(200).json({ success: true, data: clothe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
