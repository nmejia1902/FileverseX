// backend/routes/files.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const { initModels } = require('../models');

const router = express.Router();
const { User, File } = initModels();

// Carpeta de uploads
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${timestamp}-${base}${ext}`);
  },
});

// Límite opcional por archivo (100 MB)
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

/**
 * POST /api/files
 * Campo del formulario: 'file' (FormData.append('file', file))
 */
router.post(
  '/',
  auth(true),
  requirePermission('canUpload', 'No tienes permiso para subir archivos'),
  upload.single('file'),
  async (req, res) => {
    try {
      console.log('POST /api/files called', { user: req.user?.id, file: !!req.file });

      if (!req.file) return res.status(400).json({ message: 'No se recibió archivo' });

      const tokenUserId = req.user.id ?? req.user.userId;
      const user = await User.findByPk(tokenUserId);
      if (!user) {
        // eliminar archivo guardado si el usuario no existe
        fs.unlink(req.file.path, () => {});
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const fileSize = req.file.size;

      // Verificar cuota si está definida
      if (user.storageQuotaMB != null) {
        const usedBytes = (await File.sum('size', { where: { userId: user.id } })) || 0;
        const quotaBytes = user.storageQuotaMB * 1024 * 1024;
        if (usedBytes + fileSize > quotaBytes) {
          fs.unlink(req.file.path, () => {});
          return res.status(403).json({ message: 'Has excedido tu cuota de almacenamiento' });
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

      res.status(201).json({ message: 'Archivo subido correctamente', file: savedFile });
    } catch (err) {
      console.error('Error en POST /api/files:', err);
      if (req.file) fs.unlink(req.file.path, () => {});
      res.status(500).json({ message: 'Error interno', error: err.message });
    }
  }
);

/**
 * GET /api/files/:id/download
 * Descarga un archivo:
 * - Admin: puede descargar cualquier archivo
 * - Usuario normal: solo sus propios archivos
 */
router.get('/:id/download', auth(true), requirePermission('canDownload', 'No tienes permiso para descargar'), async (req, res) => {
  try {
    const fileId = Number(req.params.id);
    const file = await File.findByPk(fileId);
    if (!file) return res.status(404).json({ message: 'Archivo no encontrado' });

    const tokenUserId = req.user.id ?? req.user.userId;
    const currentUser = await User.findByPk(tokenUserId);
    if (!currentUser) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (currentUser.role !== 'admin' && file.userId !== currentUser.id) {
      return res.status(403).json({ message: 'No tienes permiso para descargar este archivo' });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: 'El archivo físico no existe en el servidor' });
    }

    res.download(file.path, file.originalName);
  } catch (err) {
    console.error('Error en GET /api/files/:id/download:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});

/**
 * DELETE /api/files/:id
 * Elimina un archivo:
 * - Admin puede eliminar cualquier archivo
 * - Usuario normal solo puede eliminar sus propios archivos
 * Requiere permiso canUpload (se usa como permiso de gestión)
 */
router.delete('/:id', auth(true), requirePermission('canUpload', 'No tienes permiso para eliminar archivos'), async (req, res) => {
  try {
    const fileId = Number(req.params.id);
    const file = await File.findByPk(fileId);
    if (!file) return res.status(404).json({ message: 'Archivo no encontrado' });

    const tokenUserId = req.user.id ?? req.user.userId;
    const currentUser = await User.findByPk(tokenUserId);
    if (!currentUser) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (currentUser.role !== 'admin' && file.userId !== currentUser.id) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este archivo' });
    }

    // Borrar archivo físico y registro
    if (file.path && fs.existsSync(file.path)) {
      fs.unlink(file.path, () => {});
    }
    await file.destroy();

    res.json({ message: 'Archivo eliminado' });
  } catch (err) {
    console.error('Error en DELETE /api/files/:id:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});

module.exports = router;
