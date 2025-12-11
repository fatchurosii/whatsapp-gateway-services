const express = require('express');

const authRoutes = require('./auth.routes');
const deviceRoutes = require('./devices.routes');
const whatsappRoutes = require('./whatsapp.routes');
const userRoutes = require('./user.routes');

const authMiddleware = require('../middleware/auth.middleware');
const apiTokenMiddleware = require('../middleware/api-token.middleware');

module.exports = function registerRoutes(app) {
  const api = express.Router();

  api.use('/auth', authRoutes);

  api.use('/devices', authMiddleware, deviceRoutes);

  api.use('/whatsapp', apiTokenMiddleware, whatsappRoutes);
  api.use('/users', authMiddleware, userRoutes);

  app.use('/api', api);

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
};
