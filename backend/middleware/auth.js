const jwt = require('jsonwebtoken');
const { initModels } = require('../models');

const { User } = initModels();

module.exports = function auth(required = true) {
  return async function (req, res, next) {
    try {
      const header = req.headers.authorization;

      if (!header) {
        if (required) return res.status(401).json({ message: 'Debes iniciar sesión' });
        return next();
      }

      const token = header.replace(/^Bearer\s+/i, '').trim();
      if (!token) {
        if (required) return res.status(401).json({ message: 'Token inválido' });
        return next();
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      } catch {
        if (required) return res.status(401).json({ message: 'Token inválido' });
        return next();
      }

      const userId =
        decoded.id ??
        decoded.userId ??
        (decoded.user && decoded.user.id);

      if (!userId) {
        if (required) return res.status(401).json({ message: 'Token inválido (sin id)' });
        return next();
      }

      const user = await User.findByPk(userId);
      if (!user) {
        if (required) return res.status(401).json({ message: 'Usuario no encontrado' });
        return next();
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        canUpload: user.canUpload,
        canDownload: user.canDownload,
        canShare: user.canShare,
        canViewReports: user.canViewReports,
        storageQuotaMB: user.storageQuotaMB,
      };

      next();
    } catch (err) {
      console.error('Error auth middleware:', err);
      if (required) return res.status(500).json({ message: 'Error interno auth' });
      next();
    }
  };
};
