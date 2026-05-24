const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth');

//REGISTRO: Crear un usuario nuevo
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

//PERFIL: Trae los datos del perfil del usuario
router.get('/me', verifyToken , userController.getMyProfile);

//EDITAR PERFIL: Editar perfil del usuario autenticado
router.put('/me', verifyToken , userController.updateMyProfile);

//SOCIAL: Seguir/Dejar de seguir a otra PERSONA
router.post('/follow-user', verifyToken, userController.followUser);

//COMUNIDAD: Seguir/Dejar de seguir un SUBFORO
router.post('/follow-subforum', verifyToken, userController.followSubforum);

module.exports = router;