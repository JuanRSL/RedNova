const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//REGISTRO: Crear un usuario nuevo
router.post('/register', userController.registerUser);

//SOCIAL: Seguir/Dejar de seguir a otra PERSONA
router.post('/follow-user', userController.followUser);

//COMUNIDAD: Seguir/Dejar de seguir un SUBFORO
router.post('/follow-subforum', userController.followSubforum);

module.exports = router;