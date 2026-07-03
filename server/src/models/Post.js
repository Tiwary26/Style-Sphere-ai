const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  outfit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit',
  },
  caption: {
    type: String,
    required: [true, 'Please add a caption'],
    trim: true,
    maxlength: 500,
  },
  imageUrl: {
    type: String,
    required: [true, 'Please upload an outfit photo'],
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  commentsCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Post', PostSchema);
