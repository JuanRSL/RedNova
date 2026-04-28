const User = require('../models/User');

exports.createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: 'Usuario creado exitosamente', user });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el usuario', error: error.message });
    }
};
