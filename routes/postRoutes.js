const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.delete('/delete/:id', postController.deletePost);

module.exports = router;