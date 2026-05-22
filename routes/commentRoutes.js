const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

// Crear un comentario
router.post('/comments', auth, commentController.createComment);

// Obtener todos los comentarios de un post específico
router.get('/post/:postId', commentController.getCommentsByPost);

router.delete('/delete', auth, commentController.deleteComment);

module.exports = router;