
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { initModels } = require('../models');

const router = express.Router();
const { User } = initModels();


const avatarDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads', 'avatars');

if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se permiten imágenes"));
    }
    cb(null, true);
  }
});



router.post('/me/avatar', auth(true), upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se envió imagen" });

    const user = await User.findByPk(req.user.id);

    if (!user) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

  
    if (user.avatarUrl) {
      const prevPath = path.join(__dirname, '..', user.avatarUrl.replace(/^\//, ''));
      if (fs.existsSync(prevPath)) fs.unlink(prevPath, () => {});
    }

    const relPath = `/uploads/avatars/${req.file.filename}`;
    user.avatarUrl = relPath;
    await user.save();

    res.json({ message: "Avatar actualizado", avatarUrl: relPath });
  } catch (err) {
    console.error("Error avatar:", err);
    res.status(500).json({ message: "Error interno", error: err.message });
  }
});


router.get('/me', auth(true), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'avatarUrl']
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error interno", error: err.message });
  }
});

module.exports = router;
