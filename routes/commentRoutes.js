const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middlewares/auth');

// Crear un comentario
router.post('/', verifyToken, commentController.createComment);

// Obtener todos los comentarios de un post específico
router.get('/post/:postId', commentController.getCommentsByPost);

router.delete('/delete', verifyToken, commentController.deleteComment);

module.exports = router;