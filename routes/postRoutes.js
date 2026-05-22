const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// Ruta para eliminar un post con validación de permisos
router.delete('/delete/:id', auth, postController.deletePost);
// Ruta para votar un post
router.post('/vote', auth, postController.votePost);

module.exports = router;