const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', postController.getAllPosts);
router.post('/', verifyToken, postController.createPost);
router.post('/vote', verifyToken, postController.votePost);
router.delete('/delete/:id', verifyToken, postController.deletePost);

module.exports = router;