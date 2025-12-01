const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { initModels } = require('../models');

const { Collection, File, User } = initModels();

/**
 * Crear una nueva colección
 * POST /api/collections
 * body: { title, description?, isPublic? }
 */
router.post('/', auth(true), async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;
    if (!title) return res.status(400).json({ message: 'El título es obligatorio' });

    const collection = await Collection.create({
      title,
      description: description || null,
      isPublic: isPublic ?? true,
      userId: req.user.id,
    });

    res.json({ collection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear colección' });
  }
});

/**
 * Listar colecciones propias
 * GET /api/collections/mine
 */
router.get('/mine', auth(true), async (req, res) => {
  try {
    const collections = await Collection.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: File,
          as: 'files',
          through: { attributes: [] }, // no mostrar tabla intermedia
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // añadimos cantidad de archivos para que sea más fácil en el frontend
    const result = collections.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      likes: c.likes,
      isPublic: c.isPublic,
      createdAt: c.createdAt,
      filesCount: c.files ? c.files.length : 0,
    }));

    res.json({ collections: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener colecciones' });
  }
});

/**
 * Listar colecciones públicas (para explorar y dar like)
 * GET /api/collections/public
 */
router.get('/public', auth(true), async (req, res) => {
  try {
    const collections = await Collection.findAll({
      where: { isPublic: true },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['likes', 'DESC']],
    });

    res.json({ collections });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener colecciones públicas' });
  }
});

/**
 * Detalle de una colección con sus archivos
 * GET /api/collections/:id
 */
router.get('/:id', auth(true), async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id, {
      include: [
        {
          model: File,
          as: 'files',
          through: { attributes: [] },
        },
      ],
    });

    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });

    // Si la colección no es pública y no es del usuario → no dejar ver
    if (!collection.isPublic && collection.userId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes acceso a esta colección' });
    }

    res.json({ collection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener la colección' });
  }
});

/**
 * Añadir un archivo a una colección
 * POST /api/collections/:id/add
 * body: { fileId }
 */
router.post('/:id/add', auth(true), async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });

    // Solo el dueño puede modificar su colección
    if (collection.userId !== req.user.id) {
      return res.status(403).json({ message: 'No puedes modificar esta colección' });
    }

    const { fileId } = req.body;
    if (!fileId) return res.status(400).json({ message: 'fileId es obligatorio' });

    const file = await File.findByPk(fileId);
    if (!file) return res.status(404).json({ message: 'Archivo no encontrado' });

    await collection.addFile(file);
    res.json({ message: 'Archivo agregado a la colección' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al agregar archivo a colección' });
  }
});

/**
 * Dar like a una colección
 * POST /api/collections/:id/like
 */
router.post('/:id/like', auth(true), async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });

    collection.likes += 1;
    await collection.save();

    res.json({ likes: collection.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al dar like' });
  }
});

/**
 * Editar colección (solo dueño)
 * PUT /api/collections/:id
 * body: { title?, description?, isPublic? }
 */
router.put('/:id', auth(true), async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });

    if (collection.userId !== req.user.id) {
      return res.status(403).json({ message: 'No puedes editar esta colección' });
    }

    const { title, description, isPublic } = req.body;

    if (title !== undefined) collection.title = title;
    if (description !== undefined) collection.description = description;
    if (isPublic !== undefined) collection.isPublic = isPublic;

    await collection.save();

    res.json({ collection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al editar colección' });
  }
});

/**
 * Eliminar colección (solo dueño)
 * DELETE /api/collections/:id
 */
router.delete('/:id', auth(true), async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });

    if (collection.userId !== req.user.id) {
      return res.status(403).json({ message: 'No puedes eliminar esta colección' });
    }

    await collection.destroy();
    res.json({ message: 'Colección eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar colección' });
  }
});

module.exports = router;
