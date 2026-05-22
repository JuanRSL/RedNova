(function(){
const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// Create forum (admin)
router.post('/', verifyToken, verifyAdmin, forumController.createForum);

// List forums
router.get('/', forumController.getAllForums);

// Get specific forum
router.get('/:id', forumController.getForumById);

// Delete forum (admin)
router.delete('/:id', verifyToken, verifyAdmin, forumController.deleteForum);

module.exports = router;
})();

