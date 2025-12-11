
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');

router.post('/', deviceController.store);
router.get('/', deviceController.getDevicePaginated);

module.exports = router;
