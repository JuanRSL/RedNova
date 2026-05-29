const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middlewares/auth');

// Crear un comentario
router.post('/', verifyToken, commentController.createComment);

// Obtener todos los comentarios de un post específico
router.get('/post/:postId', commentController.getCommentsByPost);
// Borrar un comentario )
router.delete('/:commentId', verifyToken, commentController.deleteComment);
// Votar un comentario
router.post('/:commentId/upvote', verifyToken, commentController.upvoteComment);
// Votar negativamente un comentario
router.post('/:commentId/downvote', verifyToken, commentController.downvoteComment);

module.exports = router;