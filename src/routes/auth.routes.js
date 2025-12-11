// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/profile',authMiddleware, authController.profile);
router.post('/logout', authMiddleware, authController.logout);


module.exports = router;
