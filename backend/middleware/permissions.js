// backend/middleware/permissions.js
const { initModels } = require('../models');
const { User } = initModels();

/**
 * Middleware de permisos por campo booleano (canUpload, canDownload, etc.)
 * - Si el usuario es admin => siempre tiene permiso.
 * - Si NO es admin => se valida el campo indicado.
 */
function requirePermission(field, message) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id ?? req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'No autenticado' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // 👇 BYPASS para administradores
      if (user.role === 'admin') {
        req.user.id = user.id;
        req.user.role = user.role;
        return next();
      }

      // Para usuarios normales sí validamos el campo
      if (!user[field]) {
        return res
          .status(403)
          .json({ message: message || 'No tienes permiso para esta acción' });
      }

      req.user.id = user.id;
      req.user.role = user.role;

      next();
    } catch (err) {
      console.error('Error en requirePermission:', err);
      res.status(500).json({ message: 'Error interno en permisos' });
    }
  };
}

module.exports = { requirePermission };
