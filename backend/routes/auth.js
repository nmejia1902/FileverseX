const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { initModels } = require('../models');

const router = express.Router();

const { User } = initModels();

// ========================  REGISTRO ========================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, description } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: 'Email ya registrado' });
    }

    const hashed = bcrypt.hashSync(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash: hashed,        // 👈 IMPORTANTE: usamos passwordHash
      description: description || '',
      role: 'user',
    });

    res.json({ message: 'Usuario registrado', user });
  } catch (err) {
    console.error('Error en /auth/register:', err);
    res.status(500).json({ message: 'Error al registrar', error: err.message });
  }
});

// ========================  LOGIN ========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 👇 AQUÍ estaba el problema: antes usábamos user.password
    if (!user.passwordHash) {
      return res
        .status(500)
        .json({ message: 'El usuario no tiene passwordHash almacenado' });
    }

    const ok = bcrypt.compareSync(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Error en /auth/login:', err);
    res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
  }
});

// ========================  GET /AUTH/ME ========================
router.get('/me', auth(true), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'description'],
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Error en /auth/me:', err);
    res.status(500).json({ message: 'Error interno', details: err.message });
  }
});

module.exports = router;
