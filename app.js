require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config/app.config');
const bodyParser = require('body-parser');
const db = require('./src/models'); // init sequelize & models
const registerRoutes = require('./src/routes/app.routes');
const whatsappService = require('./src/services/whatsapp.service');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

registerRoutes(app);

(async () => {
  try {
    await db.sequelize.sync();
    app.listen(config.port, () => console.log(`[SERVER] Server running on port ${config.port}`));
    
    process.on('SIGINT', async () => {
    console.log('[PROCESS] Shutting down gracefully...');
    await whatsappService.destroyAll();
    process.exit(0);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
