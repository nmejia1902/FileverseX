// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { sequelize, initModels } = require('./models');

// Rutas
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const collectionRoutes = require('./routes/collections');
const adminRoutes = require('./routes/admin');
const statsRoutes = require('./routes/stats');
const adminUserRoutes = require('./routes/adminUsers');

const app = express();

// ===== Config uploads =====
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const uploadPath = path.join(__dirname, UPLOAD_DIR);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log('📂 Carpeta de uploads creada en:', uploadPath);
}

app.use('/uploads', express.static(uploadPath));

// ===== Middlewares =====
app.use(cors());
app.use(express.json());

// ===== Rutas API =====
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminUserRoutes);

const PORT = process.env.PORT || 4000;

// ===== Arranque del servidor + BD =====
async function start() {
  try {
    // 1. Probar conexión a la BD
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // 2. Inicializar modelos y relaciones
    initModels();

    // 3. Sincronizar modelos con la BD
    // La primera vez, si quieres que cree/actualice tablas, puedes usar:
    // await sequelize.sync({ alter: true });
    await sequelize.sync();
    console.log('✅ Modelos sincronizados');

    // 4. Levantar servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

start();
