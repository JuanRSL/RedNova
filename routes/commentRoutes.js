const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Crear un comentario
router.post('/comments', commentController.createComment);

// Obtener todos los comentarios de un post específico
router.get('/post/:postId', commentController.getCommentsByPost);

router.delete('/delete', commentController.deleteComment);

module.exports = router;