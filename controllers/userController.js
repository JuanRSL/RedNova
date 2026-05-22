const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_super_secret_key'; // In production, use process.env.JWT_SECRET

exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'Usuario creado exitosamente', user });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el usuario', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

        // Create Token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el login', error: error.message });
    }
};

exports.followUser = async (req, res) => {
    try {
        const { targetId } = req.body;
        const myId = req.user.id; // From auth middleware
        // Validar que ambos usuarios existan
        const user = await User.findById(myId);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // Si ya lo sigue, lo elimina (Unfollow). Si no, lo agrega (Follow).
        const isFollowing = user.followingUsers.includes(targetId);
        const action = isFollowing ? '$pull' : '$addToSet';

        await User.findByIdAndUpdate(myId, { [action]: { followingUsers: targetId } });

        res.status(200).json({ message: isFollowing ? "Dejaste de seguir" : "Siguiendo ahora" });
    } catch (error) {
        res.status(500).json({ message: "Error en la operación de seguimiento" });
    }
};

// Función para seguir o dejar de seguir un subforo
exports.followSubforum = async (req, res) => {
    try {
        const { subredditId } = req.body;
        const userId = req.user.id; // From auth middleware

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // Verificamos si ya sigue al subforo
        const isFollowing = user.followingSubforums.includes(subredditId);

        // Si ya lo sigue, usamos $pull (quitar). Si no, $addToSet (agregar sin duplicar).
        const action = isFollowing ? '$pull' : '$addToSet';

        await User.findByIdAndUpdate(userId, {
            [action]: { followingSubforums: subredditId }
        });

        res.status(200).json({
            message: isFollowing ? "Has salido del subforo" : "Te has unido al subforo"
        });
    } catch (error) {
        res.status(500).json({ message: "Error al procesar la suscripción al subforo", error: error.message });
    }
};
