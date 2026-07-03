const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Please add comment text'],
    trim: true,
    maxlength: 200,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Comment', CommentSchema);
