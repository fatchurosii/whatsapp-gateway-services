// src/routes/auth.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');

router.post('/', deviceController.store);
// router.post('/updateDevice/:id', deviceController.updateDeviceId);

module.exports = router;
