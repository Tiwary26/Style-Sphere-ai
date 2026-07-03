const mongoose = require('mongoose');

const ClotheSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a clothing name'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: [
      'Shirts', 'T-Shirts', 'Jeans', 'Pants', 'Dresses', 
      'Kurti', 'Saree', 'Hoodies', 'Jackets', 'Shoes', 
      'Watches', 'Bags', 'Accessories'
    ],
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
    default: 'Unknown',
  },
  size: {
    type: String,
    trim: true,
    default: 'M',
  },
  fabric: {
    type: String,
    trim: true,
    default: 'Cotton',
  },
  material: {
    type: String,
    trim: true,
    default: 'Standard',
  },
  season: {
    type: String,
    required: true,
    enum: ['Summer', 'Winter', 'Spring', 'Autumn', 'All-Season'],
    default: 'All-Season',
  },
  occasion: {
    type: String,
    required: true,
    enum: ['Casual', 'Formal', 'Party', 'Sports', 'College', 'Wedding', 'Interview'],
    default: 'Casual',
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  price: {
    type: Number,
    default: 0,
  },
  laundryStatus: {
    type: String,
    enum: ['Clean', 'Dirty', 'Washing', 'Drying', 'Ironing', 'Ready To Wear'],
    default: 'Clean',
  },
  timesWorn: {
    type: Number,
    default: 0,
  },
  qrCode: {
    type: String,
  },
  imageUrls: {
    type: [String],
    default: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300'], // Default placeholder clothing
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field: Cost Per Wear
ClotheSchema.virtual('costPerWear').get(function() {
  if (!this.price || this.price === 0) return 0;
  const wearCount = this.timesWorn || 0;
  if (wearCount === 0) return this.price;
  return Number((this.price / wearCount).toFixed(2));
});

module.exports = mongoose.model('Clothe', ClotheSchema);
