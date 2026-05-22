const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

//REGISTRO: Crear un usuario nuevo
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

//SOCIAL: Seguir/Dejar de seguir a otra PERSONA
router.post('/follow-user', auth, userController.followUser);

//COMUNIDAD: Seguir/Dejar de seguir un SUBFORO
router.post('/follow-subforum', auth, userController.followSubforum);

module.exports = router;