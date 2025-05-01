const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const authMiddleware = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// Публичные маршруты (без аутентификации)
router.get('/public', skillController.getAllSkills);
router.get('/public/:id', skillController.getSkillById);
router.get('/categories/public', skillController.getCategories);
router.get('/search/public', skillController.searchSkills); // Добавляем публичный поиск

// Защищенные маршруты (требуется аутентификация)
router.get('/', authMiddleware, skillController.getAll);
router.get('/categories', authMiddleware, skillController.getCategories);
router.get('/search', authMiddleware, skillController.search);
router.get('/:id', authMiddleware, skillController.getById);
router.post('/', authMiddleware, uploadMiddleware.single('image'), skillController.create);
// Удаляем middleware загрузки изображений при обновлении навыка
router.put('/:id', authMiddleware, skillController.update);
router.delete('/:id', authMiddleware, skillController.delete);

module.exports = router;