(function(){
const express = require('express');
const router = express.Router();
const subforumController = require('../controllers/subforumController');
const { verifyToken, verifyModerator, verifyAdmin } = require('../middlewares/auth');

// Create subforum (moderator/admin)
router.post('/', verifyToken, verifyModerator, subforumController.createSubforum);

// List subforums (optional ?forumId=...)
router.get('/', subforumController.getSubforums);

// Get subforum
router.get('/:id', subforumController.getSubforumById);

// Update subforum (moderator/admin)
router.put('/:id', verifyToken, verifyModerator, subforumController.updateSubforum);

// Delete subforum (admin)
router.delete('/:id', verifyToken, verifyAdmin, subforumController.deleteSubforum);

module.exports = router;
})();

