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
router.post('/:commentId/vote', verifyToken, commentController.voteComment);
// Responder a un comentario (crear un comentario hijo)
router.post('/:commentId/reply', verifyToken, commentController.replyToComment);

module.exports = router;