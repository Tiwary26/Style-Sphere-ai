const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a wishlist item name'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Shirts', 'T-Shirts', 'Jeans', 'Pants', 'Dresses', 
      'Kurti', 'Saree', 'Hoodies', 'Jackets', 'Shoes', 
      'Watches', 'Bags', 'Accessories'
    ],
  },
  price: {
    type: Number,
    default: 0,
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300',
  },
  websiteUrl: {
    type: String,
    trim: true,
    default: '',
  },
  budgetStatus: {
    type: String,
    enum: ['Planned', 'Purchased'],
    default: 'Planned',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
