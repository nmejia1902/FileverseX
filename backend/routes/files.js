const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const auth = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { initModels } = require("../models");

const router = express.Router();
const { User, File } = initModels();

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// --- Multer ---
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${timestamp}-${base}${ext}`);
  },
});
const upload = multer({ storage });


// ================== GET FILE LIST ==================
router.get("/", auth(true), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const where = user.role === "admin" ? {} : { userId: user.id };

    const files = await File.findAll({ where, order: [["createdAt", "DESC"]] });

    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: "Error interno", error: err.message });
  }
});

// ================== UPLOAD ==================
router.post(
  "/",
  auth(true),
  requirePermission("canUpload", "No tienes permiso para subir archivos"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No se recibió archivo" });

      const saved = await File.create({
        userId: req.user.id,
        originalName: req.file.originalname,
        filename: req.file.filename, // guardamos solo nombre
        mimeType: req.file.mimetype,
        size: req.file.size,
      });

      res.status(201).json({ message: "Archivo subido", file: saved });
    } catch (err) {
      res.status(500).json({ message: "Error al subir archivo", error: err.message });
    }
  }
);

// ================== DOWNLOAD ==================
router.get(
  "/:id/download",
  auth(true),
  requirePermission("canDownload", "No puedes descargar"),
  async (req, res) => {
    try {
      const file = await File.findByPk(req.params.id);
      if (!file) return res.status(404).json({ message: "No existe archivo en DB" });

      const fullPath = path.join(uploadDir, file.filename);

      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ message: "Archivo físico no encontrado" });
      }

      await file.increment("downloads");
      res.download(fullPath, file.originalName);
    } catch (err) {
      res.status(500).json({ message: "Error interno", error: err.message });
    }
  }
);

// ================== DELETE ==================
router.delete("/:id", auth(true), requirePermission("canUpload"), async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: "No encontrado" });

    const fullPath = path.join(uploadDir, file.filename);

    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await file.destroy();

    res.json({ message: "Archivo eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error interno", error: err.message });
  }
});

module.exports = router;
