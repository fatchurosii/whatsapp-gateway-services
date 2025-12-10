// src/models/index.js
const { Sequelize } = require('sequelize');
const config = require('../../config/app.config');

const sequelize = new Sequelize({
  dialect: config.db.dialect,
  storage: config.db.storage,
  logging: config.db.logging,
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// load models
db.User = require('./user.models')(sequelize, Sequelize);
db.Device = require('./device.models')(sequelize, Sequelize);

module.exports = db;
