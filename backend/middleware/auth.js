const jwt = require('jsonwebtoken');
const { initModels } = require('../models');
const { User } = initModels();

module.exports = function auth(required = true, admin = false) {
  return async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token' });

    const token = header.replace('Bearer ', '');
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findByPk(data.id);
      if (!user) return res.status(401).json({ message: 'User not found' });
      if (user.blocked) return res.status(403).json({ message: 'User blocked' });
      if (admin && !user.isAdmin) return res.status(403).json({ message: 'Admin only' });

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};
