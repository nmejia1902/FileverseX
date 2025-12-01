const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const { initModels } = require('../models');

const router = express.Router();
const { User, File } = initModels();

// Middleware para asegurar que sea admin (consultando BD)
async function adminOnly(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    // soportar tanto req.user.id como req.user.userId por si el middleware auth lo puso distinto
    const userId = req.user.id ?? req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: 'No autenticado (sin id)' });
    }

    const dbUser = await User.findByPk(userId);

    if (!dbUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (dbUser.role !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores pueden acceder' });
    }

    // Actualizamos req.user con lo que viene de BD, por si acaso
    req.user.id = dbUser.id;
    req.user.role = dbUser.role;

    next();
  } catch (err) {
    console.error('Error en adminOnly:', err);
    res.status(500).json({ message: 'Error interno en adminOnly' });
  }
}

// Middleware: permite acceso si es admin o si está editando su propio usuario
async function selfOrAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const tokenUserId = req.user.id ?? req.user.userId;
    if (!tokenUserId) {
      return res.status(401).json({ message: 'No autenticado (sin id)' });
    }

    const targetUserId = Number(req.params.id); // /users/:id

    const dbUser = await User.findByPk(tokenUserId);
    if (!dbUser) {
      return res.status(404).json({ message: 'Usuario del token no encontrado' });
    }

    // Si es admin, puede editar a cualquiera
    if (dbUser.role === 'admin') {
      req.user.id = dbUser.id;
      req.user.role = dbUser.role;
      return next();
    }

    // Si NO es admin, solo puede editar su propio registro
    if (tokenUserId === targetUserId) {
      req.user.id = dbUser.id;
      req.user.role = dbUser.role;
      return next();
    }

    return res.status(403).json({ message: 'Solo puedes editar tu propia cuenta' });
  } catch (err) {
    console.error('Error en selfOrAdmin:', err);
    return res.status(500).json({ message: 'Error interno en selfOrAdmin' });
  }
}

/**
 * GET /api/admin/users
 * Admin -> lista todos, usuario normal -> solo su propio usuario
 */
router.get('/users', auth(true), async (req, res) => {
  try {
    const tokenUserId = req.user.id ?? req.user.userId;
    if (!tokenUserId) {
      return res.status(401).json({ message: 'No autenticado (sin id)' });
    }

    const currentUser = await User.findByPk(tokenUserId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Usuario del token no encontrado' });
    }

    let users;

    if (currentUser.role === 'admin') {
      // Admin -> ve todos
      users = await User.findAll({
        attributes: [
          'id',
          'name',
          'email',
          'role',
          'canUpload',
          'canDownload',
          'canShare',
          'canViewReports',
          'storageQuotaMB',
        ],
        order: [['id', 'ASC']],
      });
    } else {
      // Usuario normal -> solo se ve a sí mismo
      users = [currentUser];
    }

    // Calcular uso de almacenamiento por usuario (sumando Files.size)
    const result = [];
    for (const u of users) {
      const usedBytes =
        (await File.sum('size', { where: { userId: u.id } })) || 0;
      const usedMB = usedBytes / (1024 * 1024);

      result.push({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        canUpload: u.canUpload,
        canDownload: u.canDownload,
        canShare: u.canShare,
        canViewReports: u.canViewReports,
        storageQuotaMB: u.storageQuotaMB,
        usedStorageBytes: usedBytes,
        usedStorageMB: Number(usedMB.toFixed(2)),
      });
    }

    res.json({ users: result });
  } catch (err) {
    console.error('Error en GET /api/admin/users:', err);
    res
      .status(500)
      .json({ message: 'Error interno', error: err.message });
  }
});

/**
 * POST /api/admin/users
 * Crea un nuevo usuario (por el admin)
 * Body: { name, email, password, role?, canUpload?, ... }
 */
router.post('/users', auth(true), adminOnly, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'user',
      canUpload = true,
      canDownload = true,
      canShare = true,
      canViewReports = true,
      storageQuotaMB = null,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'name, email y password son obligatorios' });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res
        .status(400)
        .json({ message: 'Ya existe un usuario con ese email' });
    }

    const hashed = bcrypt.hashSync(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash: hashed,
      role,
      canUpload,
      canDownload,
      canShare,
      canViewReports,
      storageQuotaMB,
    });

    res.status(201).json({ message: 'Usuario creado', user });
  } catch (err) {
    console.error('Error en POST /api/admin/users:', err);
    res
      .status(500)
      .json({ message: 'Error interno', error: err.message });
  }
});

/**
 * PATCH /api/admin/users/:id
 * Actualiza permisos, rol o cuota de un usuario
 * Body: canUpload, canDownload, canShare, canViewReports, storageQuotaMB, role
 */
router.patch('/users/:id', auth(true), selfOrAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const {
      canUpload,
      canDownload,
      canShare,
      canViewReports,
      storageQuotaMB,
      role,
    } = req.body;

    if (typeof canUpload === 'boolean') user.canUpload = canUpload;
    if (typeof canDownload === 'boolean') user.canDownload = canDownload;
    if (typeof canShare === 'boolean') user.canShare = canShare;
    if (typeof canViewReports === 'boolean') user.canViewReports = canViewReports;
    if (storageQuotaMB !== undefined) user.storageQuotaMB = storageQuotaMB;

    // Solo los admin pueden cambiar el rol
    if (role && req.user.role === 'admin') {
      user.role = role; // 'user' | 'admin'
    }

    await user.save();

    res.json({ message: 'Usuario actualizado', user });
  } catch (err) {
    console.error('Error en PATCH /api/admin/users/:id:', err);
    res
      .status(500)
      .json({ message: 'Error interno', error: err.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Elimina un usuario (solo admin)
 */
router.delete('/users/:id', auth(true), adminOnly, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // Opcional: impedir que el admin se borre a sí mismo
    if (userId === req.user.id) {
      return res
        .status(400)
        .json({ message: 'No puedes eliminar tu propio usuario' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // TODO: si quieres, aquí podrías eliminar archivos del usuario:
    // await File.destroy({ where: { userId } });

    await user.destroy();

    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error('Error en DELETE /api/admin/users/:id:', err);
    res
      .status(500)
      .json({ message: 'Error interno', error: err.message });
  }
});

module.exports = router;
