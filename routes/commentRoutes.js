const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Crear un comentario
router.post('/', commentController.createComment);

// Obtener todos los comentarios de un post específico
router.get('/post/:postId', commentController.getCommentsByPost);

module.exports = router;