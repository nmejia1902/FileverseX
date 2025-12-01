const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { stringify } = require('csv-stringify/sync');
const { initModels } = require('../models');

const { File, Collection, User } = initModels();

router.get('/user', auth(true), async (req, res) => {
  const files = await File.findAll({ where: { userId: req.user.id }, order: [['downloads', 'DESC']] });
  const topDownloaded = files.slice(0, 5);
  res.json({ topDownloaded, totalFiles: files.length });
});

router.get('/top-collections', auth(true), async (req, res) => {
  const colls = await Collection.findAll({ order: [['likes', 'DESC']], limit: 5 });
  res.json({ collections: colls });
});

router.get('/export/csv', auth(true), async (req, res) => {
  const files = await File.findAll({ where: { userId: req.user.id } });
  const records = files.map(f => ({ id: f.id, name: f.originalName, downloads: f.downloads }));
  const csv = stringify(records, { header: true });
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

router.get('/export/json', auth(true), async (req, res) => {
  const files = await File.findAll({ where: { userId: req.user.id } });
  res.json(files);
});

router.get('/export/report/json', auth(true), async (req, res) => {
  const userId = req.user.id;

  const files = await File.findAll({
    where: { userId },
    include: [
      {
        model: Collection,
        as: 'collections',
        through: { attributes: [] },
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  const colls = await Collection.findAll({
    where: { userId },
    include: [
      {
        model: File,
        as: 'files',
        through: { attributes: [] },
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  const totalFiles = files.length;
  const totalCollections = colls.length;
  const totalDownloads = files.reduce((sum, f) => sum + (f.downloads || 0), 0);
  const totalCollectionLikes = colls.reduce((sum, c) => sum + (c.likes || 0), 0);

  const summary = {
    totalFiles,
    totalCollections,
    totalDownloads,
    totalCollectionLikes,
  };

  const filesReport = files.map((f) => ({
    id: f.id,
    nombre: f.originalName,
    tipo: f.mimeType,
    tamano_bytes: f.size,
    descargas: f.downloads,
    creado: f.createdAt,
    colecciones: f.collections ? f.collections.map((c) => c.title) : [],
    likes_totales_en_colecciones: f.collections
      ? f.collections.reduce((sum, c) => sum + (c.likes || 0), 0)
      : 0,
  }));

  const collectionsReport = colls.map((c) => ({
    id: c.id,
    titulo: c.title,
    descripcion: c.description,
    likes: c.likes,
    publica: c.isPublic,
    archivos: c.files ? c.files.length : 0,
    creado: c.createdAt,
    archivos_nombres: c.files ? c.files.map((f) => f.originalName) : [],
  }));

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="fileversex_informe_general.json"'
  );

  res.json({
    usuario: {
      id: req.user.id,
      nombre: req.user.name,
      email: req.user.email,
    },
    resumen: summary,
    archivos: filesReport,
    colecciones: collectionsReport,
  });
});

/**
 * Informe general del usuario (archivos + colecciones) en CSV
 * GET /api/stats/export/report/csv
 *
 * CSV mixto: filas de tipo "resumen", "archivo" y "coleccion"
 */
router.get('/export/report/csv', auth(true), async (req, res) => {
  const userId = req.user.id;

  const files = await File.findAll({
    where: { userId },
    include: [
      {
        model: Collection,
        as: 'collections',
        through: { attributes: [] },
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  const colls = await Collection.findAll({
    where: { userId },
    include: [
      {
        model: File,
        as: 'files',
        through: { attributes: [] },
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  const totalFiles = files.length;
  const totalCollections = colls.length;
  const totalDownloads = files.reduce((sum, f) => sum + (f.downloads || 0), 0);
  const totalCollectionLikes = colls.reduce((sum, c) => sum + (c.likes || 0), 0);

  const records = [];

  // Fila de resumen
  records.push({
    tipo: 'resumen',
    total_archivos: totalFiles,
    total_colecciones: totalCollections,
    descargas_totales: totalDownloads,
    likes_totales_colecciones: totalCollectionLikes,
  });

  // Filas de archivos
  files.forEach((f) => {
    const colecciones = f.collections ? f.collections.map((c) => c.title).join(' | ') : '';
    const likesTot = f.collections
      ? f.collections.reduce((sum, c) => sum + (c.likes || 0), 0)
      : 0;

    records.push({
      tipo: 'archivo',
      id_archivo: f.id,
      nombre_archivo: f.originalName,
      tipo_mime: f.mimeType,
      tamano_bytes: f.size,
      descargas: f.downloads,
      colecciones: colecciones,
      likes_totales_en_colecciones: likesTot,
      creado: f.createdAt,
    });
  });

  // Filas de colecciones
  colls.forEach((c) => {
    const archivosNombres = c.files ? c.files.map((f) => f.originalName).join(' | ') : '';

    records.push({
      tipo: 'coleccion',
      id_coleccion: c.id,
      titulo_coleccion: c.title,
      descripcion: c.description,
      likes_coleccion: c.likes,
      publica: c.isPublic ? 1 : 0,
      cantidad_archivos: c.files ? c.files.length : 0,
      archivos_nombres: archivosNombres,
      creado: c.createdAt,
    });
  });

  const csv = stringify(records, { header: true, delimiter: ';' });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="fileversex_informe_general.csv"'
  );
  res.send(csv);
});

module.exports = router;
