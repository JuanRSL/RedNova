const mongoose = require('mongoose');
const User = require('../models/User');
const Subforum = require('../models/Subforum');
const Forum = require('../models/Forum');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /(?=.*[A-Z])(?=.*\d)/;

const normalizeString = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const toggleFollow = async ({ user, targetId, followField }) => {
    const isFollowing = (user[followField] || []).map(String).includes(String(targetId));
    const action = isFollowing ? '$pull' : '$addToSet';
    await User.findByIdAndUpdate(user._id, { [action]: { [followField]: targetId } });
    return isFollowing;
};

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const username = normalizeString(req.body.username);
        const email = normalizeString(req.body.email);
        const password = req.body.password;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'username, email y password son obligatorios' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: 'Formato de email inválido' });
        }

        if (password.length < 6 || !PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres, una mayúscula y un número' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(409).json({ message: 'El usuario o email ya está registrado' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id, username: user.username, roles: user.roles }, JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            token,
            user: { id: user._id, username: user.username, email: user.email, roles: user.roles },
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Error de validación', error: error.message });
        }
        res.status(400).json({ message: 'Error al crear el usuario', error: error.message });
    }
};

// Login
exports.loginUser = async (req, res) => {
    try {
        const email = normalizeString(req.body.email);
        const password = req.body.password;

        if (!email || !password) return res.status(400).json({ message: 'Email y contraseña son obligatorios' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

        const token = jwt.sign({ id: user._id, username: user.username, roles: user.roles }, JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user._id, username: user.username, email: user.email, roles: user.roles },
        });
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
        const rawEmail = req.body.email;
        const email = rawEmail !== undefined ? normalizeString(rawEmail) : undefined;
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        if ((newPassword || (email && email !== user.email)) && !currentPassword) {
            return res.status(400).json({ message: 'Se requiere la contraseña actual para cambiar email o password' });
        }

        if (rawEmail !== undefined && email === '') {
            return res.status(400).json({ message: 'Email no puede estar vacío' });
        }

        if (email && email !== user.email) {
            if (!EMAIL_REGEX.test(email)) {
                return res.status(400).json({ message: 'Formato de email inválido' });
            }
            const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) return res.status(409).json({ message: 'El email ya está en uso' });
            user.email = email;
        }

        if (currentPassword && newPassword) {
            if (newPassword.length < 6 || !PASSWORD_REGEX.test(newPassword)) {
                return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres, una mayúscula y un número' });
            }
            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        res.status(200).json({ message: 'Perfil actualizado correctamente' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Error de validación', error: error.message });
        }
        res.status(500).json({ message: 'Error al actualizar el perfil', error: error.message });
    }
};

// Follow / Unfollow a user
exports.followUser = async (req, res) => {
    try {
        const myId = req.user.id;
        const targetId = req.params.id;

        if (!targetId || !isValidObjectId(targetId)) {
            return res.status(400).json({ message: 'targetId inválido' });
        }
        if (myId === targetId) return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });

        const user = await User.findById(myId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const targetExists = await User.findById(targetId);
        if (!targetExists) return res.status(404).json({ message: 'Usuario objetivo no encontrado' });

        const isFollowing = await toggleFollow({ user, targetId, followField: 'followingUsers' });
        res.status(200).json({ message: isFollowing ? 'Dejaste de seguir' : 'Siguiendo ahora' });
    } catch (error) {
        res.status(500).json({ message: 'Error en la operación de seguimiento', error: error.message });
    }
};

// Follow / Unfollow a subforum
exports.followSubforum = async (req, res) => {
    try {
        const userId = req.user.id;
        const subforumId = req.params.id;

        if (!subforumId || !isValidObjectId(subforumId)) {
            return res.status(400).json({ message: 'subforumId inválido' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const subforum = await Subforum.findById(subforumId);
        if (!subforum) return res.status(404).json({ message: 'Subforum no encontrado' });

        const isFollowing = await toggleFollow({ user, targetId: subforumId, followField: 'followingSubforums' });
        res.status(200).json({ message: isFollowing ? 'Has salido del subforo' : 'Te has unido al subforo' });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar la suscripción al subforo', error: error.message });
    }
};

// Follow / Unfollow a forum
exports.followForum = async (req, res) => {
    try {
        const userId = req.user.id;
        const forumId = req.params.id;

        if (!forumId || !isValidObjectId(forumId)) {
            return res.status(400).json({ message: 'forumId inválido o requerido' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const forum = await Forum.findById(forumId);
        if (!forum) return res.status(404).json({ message: 'Forum no encontrado' });

        const isFollowing = await toggleFollow({ user, targetId: forumId, followField: 'followingForums' });
        res.status(200).json({ message: isFollowing ? 'Dejaste de seguir el foro' : 'Siguiendo el foro ahora' });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar la suscripción al foro', error: error.message });
    }
};
