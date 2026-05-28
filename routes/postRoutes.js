const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken } = require('../middlewares/auth');

// GET all posts
router.get('/', postController.getAllPosts);

// CREATE post
router.post('/', verifyToken, postController.createPost);

// VOTE post
router.post('/:id/vote', verifyToken, postController.votePost);

// DELETE post
router.delete('/:id', verifyToken, postController.deletePost);

module.exports = router;