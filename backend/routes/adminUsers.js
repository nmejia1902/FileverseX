
const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const { initModels } = require('../models');

const router = express.Router();
const { User, File } = initModels();


async function verifyAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const dbUser = await User.findByPk(req.user.id);
    if (!dbUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const role = (dbUser.role || '').toString().toLowerCase();
    const isAdminFlag = !!dbUser.isAdmin;

    
    if (!isAdminFlag && role !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores pueden acceder' });
    }

   
    req.user.role = dbUser.role;
    req.user.isAdmin = isAdminFlag;

    next();
  } catch (err) {
    console.error('Error en verifyAdmin:', err);
    res.status(500).json({ message: 'Error interno de permisos' });
  }
}


router.get('/users', auth(true), verifyAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
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

    const result = [];
    for (const u of users) {
      const usedBytes = (await File.sum('size', { where: { userId: u.id } })) || 0;
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
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});


router.post('/users', auth(true), verifyAdmin, async (req, res) => {
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
      return res.status(400).json({ message: 'Ya existe un usuario con ese email' });
    }

    const hashed = bcrypt.hashSync(password, 10);

    await User.create({
      name,
      email,
      passwordHash: hashed,
      role,
      canUpload,
      canDownload,
      canShare,
      canViewReports,
      storageQuotaMB,
      isAdmin: role === 'admin' ? 1 : 0,
    });

    res.status(201).json({ message: 'Usuario creado' });
  } catch (err) {
    console.error('Error en POST /api/admin/users:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});


router.patch('/users/:id', auth(true), verifyAdmin, async (req, res) => {
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
    if (role) {
      user.role = role;
      user.isAdmin = role === 'admin' ? 1 : 0;
    }

    await user.save();

    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    console.error('Error en PATCH /api/admin/users/:id:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});


router.delete('/users/:id', auth(true), verifyAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.destroy();

    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error('Error en DELETE /api/admin/users/:id:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});

module.exports = router;
