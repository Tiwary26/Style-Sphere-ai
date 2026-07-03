const mongoose = require('mongoose');

const TravelItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  clothe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clothe',
  },
  customItemName: {
    type: String,
    trim: true,
  },
  packed: {
    type: Boolean,
    default: false,
  }
});

const TravelPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destination: {
    type: String,
    required: [true, 'Please provide a destination'],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date'],
  },
  days: {
    type: Number,
    required: true,
  },
  weather: {
    type: String,
    default: 'Moderate',
  },
  occasion: {
    type: String,
    default: 'Vacation',
  },
  items: [TravelItemSchema],
  checklistGenerated: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('TravelPlan', TravelPlanSchema);
