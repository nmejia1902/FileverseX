// middleware/permissions.js
const { initModels } = require('../models');
const { User } = initModels();

function requirePermission(field, message) {
  return async (req, res, next) => {
    try {
      const userId = req.user.id ?? req.user.userId;
      if (!userId) {
        return res.status(401).json({ message: 'No autenticado (sin id)' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      if (!user[field]) {
        return res.status(403).json({ message: message || 'No tienes permiso para esta acción' });
      }

      next();
    } catch (err) {
      console.error('Error en requirePermission:', err);
      res.status(500).json({ message: 'Error interno en permisos' });
    }
  };
}

module.exports = { requirePermission };
