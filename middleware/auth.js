// Compatibility shim for code expecting ../middleware/auth
const { verifyToken } = require('../middlewares/auth');

// Export default middleware function (used as `auth` in some routes)
module.exports = verifyToken;
