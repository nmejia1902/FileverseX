
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { stringify } = require('csv-stringify/sync');
const { initModels } = require('../models');

const { File, Collection, User } = initModels();

router.get('/user', auth(true), async (req, res) => {
  try {
    const files = await File.findAll({
      where: { userId: req.user.id },
      order: [['downloads', 'DESC']],
    });
    const topDownloaded = files.slice(0, 5);
    res.json({ topDownloaded, totalFiles: files.length });
  } catch (err) {
    console.error('Error GET /api/stats/user:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});

router.get('/top-collections', auth(true), async (req, res) => {
  try {
    const colls = await Collection.findAll({ order: [['likes', 'DESC']], limit: 5 });
    res.json({ collections: colls });
  } catch (err) {
    console.error('Error GET /api/stats/top-collections:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});

router.get('/export/csv', auth(true), async (req, res) => {
  try {
    const files = await File.findAll({ where: { userId: req.user.id } });
    const records = files.map((f) => ({
      id: f.id,
      name: f.originalName,
      downloads: f.downloads || 0,
      size_bytes: f.size || 0,
      mimeType: f.mimeType || '',
      createdAt: f.createdAt || '',
    }));
    const csv = stringify(records, { header: true });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.send(csv);
  } catch (err) {
    console.error('Error GET /api/stats/export/csv:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});

router.get('/export/json', auth(true), async (req, res) => {
  try {
    const files = await File.findAll({ where: { userId: req.user.id } });
    res.json(files);
  } catch (err) {
    console.error('Error GET /api/stats/export/json:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});

router.get('/export/report/json', auth(true), async (req, res) => {
  try {
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
      descargas: f.downloads || 0,
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
      likes: c.likes || 0,
      publica: !!c.isPublic,
      archivos: c.files ? c.files.length : 0,
      creado: c.createdAt,
      archivos_nombres: c.files ? c.files.map((f) => f.originalName) : [],
    }));

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="fileversex_informe_general.json"');

    res.json({
      usuario: {
        id: req.user.id,
        nombre: req.user.name || '',
        email: req.user.email || '',
      },
      resumen: summary,
      archivos: filesReport,
      colecciones: collectionsReport,
    });
  } catch (err) {
    console.error('Error GET /api/stats/export/report/json:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});

router.get('/export/report/csv', auth(true), async (req, res) => {
  try {
    const userId = req.user.id;

    const files = await File.findAll({
      where: { userId },
      include: [
        {
          model: Collection,
          as: 'collections',
          through: { attributes: [] },
          attributes: ['id', 'title', 'likes'],
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
          attributes: ['id', 'originalName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const totalFiles = files.length;
    const totalCollections = colls.length;
    const totalDownloads = files.reduce((sum, f) => sum + (f.downloads || 0), 0);
    const totalCollectionLikes = colls.reduce((sum, c) => sum + (c.likes || 0), 0);

 
    const columns = [
      'tipo',

      'total_archivos',
      'total_colecciones',
      'descargas_totales',
      'likes_totales_colecciones',

      'id_archivo',
      'nombre_archivo',
      'tipo_mime',
      'tamano_bytes',
      'tamano_mb',
      'descargas_archivo',
      'colecciones_del_archivo',
      'likes_totales_en_colecciones_del_archivo',
      'creado_archivo',

      'id_coleccion',
      'titulo_coleccion',
      'descripcion_coleccion',
      'likes_coleccion',
      'publica_coleccion',
      'cantidad_archivos_coleccion',
      'archivos_nombres_en_coleccion',
      'creado_coleccion',
    ];

    const records = [];

    records.push({
      tipo: 'resumen',
      total_archivos: totalFiles,
      total_colecciones: totalCollections,
      descargas_totales: totalDownloads,
      likes_totales_colecciones: totalCollectionLikes,
    });

 
    files.forEach((f) => {
      const colecciones = (f.collections || []).map((c) => c.title).join(' | ');
      const likesTot = (f.collections || []).reduce((s, c) => s + (c.likes || 0), 0);

      records.push({
        tipo: 'archivo',
        id_archivo: f.id,
        nombre_archivo: f.originalName || '',
        tipo_mime: f.mimeType || '',
        tamano_bytes: f.size || 0,
        tamano_mb: f.size ? +(f.size / (1024 * 1024)).toFixed(2) : 0,
        descargas_archivo: f.downloads || 0,
        colecciones_del_archivo: colecciones,
        likes_totales_en_colecciones_del_archivo: likesTot,
        creado_archivo: f.createdAt || '',
      });
    });

    colls.forEach((c) => {
      const archivosNombres = (c.files || []).map((f) => f.originalName).join(' | ');
      records.push({
        tipo: 'coleccion',
        id_coleccion: c.id,
        titulo_coleccion: c.title || '',
        descripcion_coleccion: c.description || '',
        likes_coleccion: c.likes || 0,
        publica_coleccion: c.isPublic ? 1 : 0,
        cantidad_archivos_coleccion: c.files ? c.files.length : 0,
        archivos_nombres_en_coleccion: archivosNombres,
        creado_coleccion: c.createdAt || '',
      });
    });

    const csv = stringify(records, { header: true, columns });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="fileversex_informe_general.csv"');
    res.send(csv);
  } catch (err) {
    console.error('Error GET /api/stats/export/report/csv:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});

module.exports = router;
