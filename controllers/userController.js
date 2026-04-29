const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
 
// CONTROLADOR PARA REGISTRAR UN USUARIO
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
 
        // Verificar que no exista el username o email
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: 'El usuario o email ya está registrado' });
        }
 
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
 
        await user.save();
 
        // Generar token inmediatamente tras el registro
        const token = jwt.sign(
            { id: user._id, username: user.username, roles: user.roles },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
 
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                roles: user.roles,
            }
        });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el usuario', error: error.message });
    }
};
 
// CONTROLADOR PARA INICIAR SESIÓN
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
 
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
        }
 
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
 
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
 
        const token = jwt.sign(
            { id: user._id, username: user.username, roles: user.roles },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
 
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                roles: user.roles,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
};
 
// CONTROLADOR PARA OBTENER EL PERFIL DEL USUARIO AUTENTICADO
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('followingUsers', 'username')
            .populate('followingSubforums', 'name');
 
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
 
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
    }
};
 
// CONTROLADOR PARA SEGUIR / DEJAR DE SEGUIR A UN USUARIO
exports.followUser = async (req, res) => {
    try {
        const myId = req.user.id; // viene del token, no del body
        const { targetId } = req.body;
 
        if (myId === targetId) {
            return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });
        }
 
        const user = await User.findById(myId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
 
        const targetExists = await User.findById(targetId);
        if (!targetExists) return res.status(404).json({ message: 'Usuario objetivo no encontrado' });
 
        const isFollowing = user.followingUsers.includes(targetId);
        const action = isFollowing ? '$pull' : '$addToSet';
 
        await User.findByIdAndUpdate(myId, { [action]: { followingUsers: targetId } });
 
        res.status(200).json({ message: isFollowing ? 'Dejaste de seguir' : 'Siguiendo ahora' });
    } catch (error) {
        res.status(500).json({ message: 'Error en la operación de seguimiento', error: error.message });
    }
};
 
// CONTROLADOR PARA SEGUIR / DEJAR DE SEGUIR UN SUBFORO
exports.followSubforum = async (req, res) => {
    try {
        const userId = req.user.id; // viene del token
        const { subredditId } = req.body;
 
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
 
        const isFollowing = user.followingSubforums.includes(subredditId);
        const action = isFollowing ? '$pull' : '$addToSet';
 
        await User.findByIdAndUpdate(userId, {
            [action]: { followingSubforums: subredditId }
        });
 
        res.status(200).json({
            message: isFollowing ? 'Has salido del subforo' : 'Te has unido al subforo'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar la suscripción al subforo', error: error.message });
    }
};