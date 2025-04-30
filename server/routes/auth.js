const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Публичные маршруты (без аутентификации)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Защищенные маршруты (требуется аутентификация)
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;