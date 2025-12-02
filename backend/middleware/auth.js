// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { initModels } = require('../models');

const { User } = initModels();

/**
 * auth(required = true)
 * - Si required = true -> devuelve 401 si no hay token o es inválido
 * - Si required = false -> deja pasar aun sin token (req.user puede ser undefined)
 */
module.exports = function auth(required = true) {
  return async function (req, res, next) {
    try {
      const header = req.headers.authorization;

      if (!header) {
        if (required) {
          return res.status(401).json({ message: 'Debes iniciar sesión' });
        }
        return next();
      }

      // "Bearer xxxxx"
      const token = header.replace(/^Bearer\s+/i, '').trim();
      if (!token) {
        if (required) {
          return res.status(401).json({ message: 'Token inválido' });
        }
        return next();
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.error('JWT verify error:', err);
        if (required) {
          return res.status(401).json({ message: 'Token inválido' });
        }
        return next();
      }

      // Soportar varios formatos de payload:
      // { userId }, { id }, { user: { id } }, etc.
      const userId =
        decoded.userId ??
        decoded.id ??
        decoded.userId ??
        (decoded.user && decoded.user.id);

      if (!userId) {
        if (required) {
          return res
            .status(401)
            .json({ message: 'Token inválido (sin id de usuario)' });
        }
        return next();
      }

      // Cargar usuario real desde BD
      const user = await User.findByPk(userId);
      if (!user) {
        if (required) {
          return res.status(401).json({ message: 'Usuario no encontrado' });
        }
        return next();
      }

      // Guardamos datos importantes en req.user
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role, // <-- IMPORTANTÍSIMO
        canUpload: user.canUpload,
        canDownload: user.canDownload,
        canShare: user.canShare,
        canViewReports: user.canViewReports,
        storageQuotaMB: user.storageQuotaMB,
      };

      next();
    } catch (err) {
      console.error('Error en auth middleware:', err);
      if (required) {
        return res
          .status(500)
          .json({ message: 'Error interno de autenticación' });
      }
      next();
    }
  };
};
