const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Get all posts for feed
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username profileImage')
      .populate({
        path: 'outfit',
        populate: { path: 'clothes' }
      })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new post to feed
exports.createPost = async (req, res) => {
  try {
    const { caption, imageUrl, outfitId } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Please provide an image url for the post' });
    }

    const post = await Post.create({
      user: req.user.id,
      caption: caption || '',
      imageUrl,
      outfit: outfitId || null,
    });

    // Award badge if user posts to community
    const user = await User.findById(req.user.id);
    const hasBadge = user.badges.some(b => b.name === 'Community Icon');
    if (!hasBadge) {
      user.badges.push({
        name: 'Community Icon',
        description: 'Shared an outfit with the StyleSphere community',
        icon: 'users'
      });
      await user.save();
    }

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username profileImage')
      .populate('outfit');

    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Like / unlike a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex === -1) {
      // Like
      post.likes.push(req.user.id);
    } else {
      // Unlike
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.status(200).json({ success: true, likes: post.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get comments for a post
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'username profileImage')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a comment on a post
exports.createComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Please provide comment text' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      user: req.user.id,
      post: req.params.postId,
      text,
    });

    // Increment comment count
    post.commentsCount += 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username profileImage');

    res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
