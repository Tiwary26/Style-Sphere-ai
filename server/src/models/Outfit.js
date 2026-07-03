const mongoose = require('mongoose');

const OutfitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please specify an outfit name'],
    trim: true,
  },
  clothes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clothe',
    required: true,
  }],
  season: {
    type: String,
    enum: ['Summer', 'Winter', 'Spring', 'Autumn', 'All-Season'],
    default: 'All-Season',
  },
  occasion: {
    type: String,
    enum: ['Casual', 'Formal', 'Party', 'Sports', 'College', 'Wedding', 'Interview'],
    default: 'Casual',
  },
  mood: {
    type: String,
    trim: true,
    default: 'Neutral',
  },
  timesWorn: {
    type: Number,
    default: 0,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Outfit', OutfitSchema);
