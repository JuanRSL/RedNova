const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// Ruta para eliminar un post con validación de permisos
router.delete('/delete/:id', auth, postController.deletePost);
// Ruta para votar un post
<<<<<<< HEAD
router.post('/vote', postController.votePost);
//Funciones faltantes del CRUD
router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
=======
router.post('/vote', auth, postController.votePost);

>>>>>>> juanrodriguez
module.exports = router;