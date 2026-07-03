const mongoose = require('mongoose');

const LaundrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clothe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clothe',
    required: true,
  },
  status: {
    type: String,
    enum: ['Clean', 'Dirty', 'Washing', 'Drying', 'Ironing', 'Ready To Wear'],
    default: 'Dirty',
  },
  reminderDate: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Laundry', LaundrySchema);
