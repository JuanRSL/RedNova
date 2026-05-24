const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// MIDDLEWARE: Verifica que el token JWT sea válido
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
 
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado: token no proporcionado' });
    }
 
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, username, roles }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
};
 
// MIDDLEWARE: Solo permite acceso a admins
const verifyAdmin = (req, res, next) => {
    if (!req.user?.roles?.includes('admin')) {
        return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    }
    next();
};
 
// MIDDLEWARE: Permite acceso a moderadores o admins
const verifyModerator = (req, res, next) => {
    const roles = req.user?.roles || [];
    if (!roles.includes('moderator') && !roles.includes('admin')) {
        return res.status(403).json({ message: 'Acceso denegado: se requiere rol de moderador' });
    }
    next();
};
 
module.exports = { verifyToken, verifyAdmin, verifyModerator };