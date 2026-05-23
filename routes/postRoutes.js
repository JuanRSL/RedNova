const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken } = require('../middlewares/auth');

// Ruta para eliminar un post con validación de permisos
router.delete('/delete/:id', verifyToken, postController.deletePost);
// Ruta para votar un post
router.post('/vote', verifyToken, postController.votePost);

module.exports = router;