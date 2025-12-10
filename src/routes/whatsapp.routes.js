const express = require('express');
const router = express.Router();
const controller = require('../controllers/whatsapp.controller');

router.post('/clients', controller.create);

router.get('/clients/status', controller.status);

// router.get('/clients/:clientId/qr', apiToken, controller.qr);

// router.post('/send', apiToken, controller.sendMessage);

// router.post('/clients/logout', apiToken, controller.logout);


module.exports = router;