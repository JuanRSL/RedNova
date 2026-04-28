const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Ruta para eliminar un post con validación de permisos
router.delete('/delete/:id', postController.deletePost);
// Ruta para votar un post
router.post('/vote', postController.votePost);

module.exports = router;