const express = require('express');
const router = express.Router();
const controller = require('../controllers/whatsapp.controller');

router.get('/clients/status', controller.status);

router.get('/clients/qr', controller.qr);

// router.post('/send', apiToken, controller.sendMessage);

// router.post('/clients/logout', apiToken, controller.logout);


module.exports = router;