// routes/files.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const { initModels } = require('../models');

const router = express.Router();
const { User, File } = initModels();

// Configuración básica de multer (sube a carpeta "uploads")
const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // nombre único: timestamp-original.ext
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${timestamp}-${base}${ext}`);
  },
});

const upload = multer({ storage });

/**
 * GET /api/files
 * Lista archivos:
 *  - Admin: todos los archivos
 *  - Usuario normal: solo sus archivos
 */
router.get('/', auth(true), async (req, res) => {
  try {
    const tokenUserId = req.user.id ?? req.user.userId;
    if (!tokenUserId) {
      return res.status(401).json({ message: 'No autenticado (sin id)' });
    }

    const currentUser = await User.findByPk(tokenUserId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Usuario del token no encontrado' });
    }

    const where = currentUser.role === 'admin' ? {} : { userId: currentUser.id };

    const files = await File.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json({ files });
  } catch (err) {
    console.error('Error en GET /api/files:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});

/**
 * POST /api/files
 * Sube un archivo (requiere canUpload = true y respetar storageQuotaMB)
 * Campo del formulario: "file"
 */
router.post(
  '/',
  auth(true),
  requirePermission('canUpload', 'No tienes permiso para subir archivos'),
  upload.single('file'),
  async (req, res) => {
    try {
      const tokenUserId = req.user.id ?? req.user.userId;
      if (!tokenUserId) {
        // En teoría auth ya habría cortado antes, pero por si acaso
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }
        return res.status(401).json({ message: 'No autenticado (sin id)' });
      }

      const user = await User.findByPk(tokenUserId);
      if (!user) {
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No se recibió archivo' });
      }

      const fileSize = req.file.size; // bytes

      // Verificar cuota de almacenamiento si está definida (storageQuotaMB)
      if (user.storageQuotaMB != null) {
        const usedBytes = (await File.sum('size', { where: { userId: user.id } })) || 0;
        const quotaBytes = user.storageQuotaMB * 1024 * 1024;
        const newTotal = usedBytes + fileSize;

        if (newTotal > quotaBytes) {
          // Borramos el archivo recién subido
          fs.unlink(req.file.path, () => {});
          return res
            .status(403)
            .json({ message: 'Has excedido tu cuota de almacenamiento' });
        }
      }

      // Guardar registro en BD
      const savedFile = await File.create({
        userId: user.id,
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        size: fileSize,
        path: req.file.path,
      });

      res.status(201).json({
        message: 'Archivo subido correctamente',
        file: savedFile,
      });
    } catch (err) {
      console.error('Error en POST /api/files:', err);

      // Si algo falla y hay archivo, intentar borrarlo
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }

      res.status(500).json({ message: 'Error interno', error: err.message });
    }
  }
);

/**
 * GET /api/files/:id/download
 * Descarga un archivo (requiere canDownload = true)
 * - Admin: puede descargar cualquier archivo
 * - Usuario normal: solo archivos propios
 */
router.get(
  '/:id/download',
  auth(true),
  requirePermission('canDownload', 'No tienes permiso para descargar archivos'),
  async (req, res) => {
    try {
      const fileId = Number(req.params.id);
      const tokenUserId = req.user.id ?? req.user.userId;

      const currentUser = await User.findByPk(tokenUserId);
      if (!currentUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const file = await File.findByPk(fileId);
      if (!file) {
        return res.status(404).json({ message: 'Archivo no encontrado' });
      }

      // Si no es admin, solo puede acceder a sus propios archivos
      if (currentUser.role !== 'admin' && file.userId !== currentUser.id) {
        return res
          .status(403)
          .json({ message: 'No tienes permiso para descargar este archivo' });
      }

      if (!fs.existsSync(file.path)) {
        return res
          .status(404)
          .json({ message: 'El archivo físico no existe en el servidor' });
      }

      res.download(file.path, file.originalName);
    } catch (err) {
      console.error('Error en GET /api/files/:id/download:', err);
      res.status(500).json({ message: 'Error interno', error: err.message });
    }
  }
);

/**
 * DELETE /api/files/:id
 * Elimina un archivo
 * - Requiere canUpload (lo usamos como permiso de gestión de archivos)
 * - Admin: puede borrar cualquier archivo
 * - Usuario normal: solo sus propios archivos
 */
router.delete(
  '/:id',
  auth(true),
  requirePermission('canUpload', 'No tienes permiso para eliminar archivos'),
  async (req, res) => {
    try {
      const fileId = Number(req.params.id);
      const tokenUserId = req.user.id ?? req.user.userId;

      const currentUser = await User.findByPk(tokenUserId);
      if (!currentUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const file = await File.findByPk(fileId);
      if (!file) {
        return res.status(404).json({ message: 'Archivo no encontrado' });
      }

      if (currentUser.role !== 'admin' && file.userId !== currentUser.id) {
        return res
          .status(403)
          .json({ message: 'No tienes permiso para eliminar este archivo' });
      }

      // Borrar archivo físico
      if (file.path && fs.existsSync(file.path)) {
        fs.unlink(file.path, () => {});
      }

      await file.destroy();

      res.json({ message: 'Archivo eliminado' });
    } catch (err) {
      console.error('Error en DELETE /api/files/:id:', err);
      res.status(500).json({ message: 'Error interno', error: err.message });
    }
  }
);

module.exports = router;
