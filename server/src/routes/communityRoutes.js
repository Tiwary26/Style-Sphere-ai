const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  likePost,
  getComments,
  createComment,
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

router.use(protect); // Secure all community routes

router.route('/posts')
  .get(getPosts)
  .post(createPost);

router.post('/posts/:id/like', likePost);

router.route('/posts/:postId/comments')
  .get(getComments)
  .post(createComment);

module.exports = router;
