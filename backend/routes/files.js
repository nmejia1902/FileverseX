const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const { initModels } = require('../models');

const { File } = initModels();
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
});

const upload = multer({ storage });

router.post('/upload', auth(true), upload.single('file'), async (req, res) => {
  try {
    const f = req.file;
    if (!f) return res.status(400).json({ message: 'No file provided' });

    const file = await File.create({
      filename: f.filename,
      originalName: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
      url: `/uploads/${f.filename}`,
      userId: req.user.id,
    });

    res.json({ file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/download/:id', auth(true), async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.downloads += 1;
    await file.save();

    const filePath = path.join(process.cwd(), UPLOAD_DIR, file.filename);
    res.download(filePath, file.originalName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my', auth(true), async (req, res) => {
  try {
    const files = await File.findAll({ where: { userId: req.user.id } });
    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth(true), async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: 'Archivo no encontrado' });

    // Solo el dueño puede eliminarlo
    if (file.userId !== req.user.id) {
      return res.status(403).json({ message: 'No puedes eliminar este archivo' });
    }

    await file.destroy();
    res.json({ message: 'Archivo eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar archivo' });
  }
});

module.exports = router;
