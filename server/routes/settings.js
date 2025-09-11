const express = require('express');
const { 
  getUserSettings, 
  saveUserSetting, 
  saveUserSettings, 
  deleteUserSetting 
} = require('../controllers/settingsController');
const auth = require('../middleware/auth');

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(auth);

// GET /api/settings - получить настройки пользователя
router.get('/', getUserSettings);

// POST /api/settings - сохранить одну настройку
router.post('/', saveUserSetting);

// POST /api/settings/bulk - сохранить множественные настройки
router.post('/bulk', saveUserSettings);

// DELETE /api/settings/:setting_name - удалить настройку
router.delete('/:setting_name', deleteUserSetting);

module.exports = router;
