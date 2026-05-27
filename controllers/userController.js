const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'username, email y password son obligatorios' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(409).json({ message: 'El usuario o email ya está registrado' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id, username: user.username, roles: user.roles }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            token,
            user: { id: user._id, username: user.username, email: user.email, roles: user.roles }
        });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el usuario', error: error.message });
    }
};

// Login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email y contraseña son obligatorios' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

        const token = jwt.sign({ id: user._id, username: user.username, roles: user.roles }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

        res.status(200).json({ message: 'Inicio de sesión exitoso', token, user: { id: user._id, username: user.username, email: user.email, roles: user.roles } });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
};

// Get authenticated user's profile
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
    }
};

// Update profile
exports.updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, currentPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        if ((newPassword || (email && email !== user.email)) && !currentPassword) {
            return res.status(400).json({ message: 'Se requiere la contraseña actual para cambiar email o password' });
        }

        if (currentPassword && newPassword) {
            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });
            user.password = await bcrypt.hash(newPassword, 10);
        }

        if (email && email !== user.email) user.email = email;

        await user.save();
        res.status(200).json({ message: 'Perfil actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el perfil', error: error.message });
    }
};

// Follow / Unfollow a user
exports.followUser = async (req, res) => {
    try {
        const myId = req.user.id;
        const { targetId } = req.body;
        if (!targetId) return res.status(400).json({ message: 'targetId es requerido' });
        if (myId === targetId) return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });

        const user = await User.findById(myId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const targetExists = await User.findById(targetId);
        if (!targetExists) return res.status(404).json({ message: 'Usuario objetivo no encontrado' });

        const isFollowing = user.followingUsers.map(String).includes(String(targetId));
        const action = isFollowing ? '$pull' : '$addToSet';

        await User.findByIdAndUpdate(myId, { [action]: { followingUsers: targetId } });
        res.status(200).json({ message: isFollowing ? 'Dejaste de seguir' : 'Siguiendo ahora' });
    } catch (error) {
        res.status(500).json({ message: 'Error en la operación de seguimiento', error: error.message });
    }
};

// Follow / Unfollow a subforum
exports.followSubforum = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subredditId } = req.body;
        if (!subredditId) return res.status(400).json({ message: 'subredditId es requerido' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const isFollowing = user.followingSubforums.map(String).includes(String(subredditId));
        const action = isFollowing ? '$pull' : '$addToSet';

        await User.findByIdAndUpdate(userId, { [action]: { followingSubforums: subredditId } });
        res.status(200).json({ message: isFollowing ? 'Has salido del subforo' : 'Te has unido al subforo' });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar la suscripción al subforo', error: error.message });
    }
};
