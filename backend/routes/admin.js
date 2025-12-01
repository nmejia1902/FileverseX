const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { initModels } = require('../models');

const { User, File } = initModels();


router.post('/users/:id/block', auth(true, true), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.blocked = true;
  await user.save();
  res.json({ message: 'User blocked' });
});

router.post('/files/:id/remove', auth(true, true), async (req, res) => {
  const file = await File.findByPk(req.params.id);
  if (!file) return res.status(404).json({ message: 'File not found' });
  await file.destroy();
  res.json({ message: 'File removed' });
});

module.exports = router;
