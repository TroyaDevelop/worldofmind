const express = require('express');
const router = express.Router();
const neuronController = require('../controllers/neuronController');
const authMiddleware = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// Публичные маршруты (без аутентификации)
router.get('/public', neuronController.getAllNeurons);
router.get('/public/:id', neuronController.getNeuronById);
router.get('/categories/public', neuronController.getCategories);

// Защищенные маршруты (требуется аутентификация)
router.get('/', authMiddleware, neuronController.getAll);
router.get('/categories', authMiddleware, neuronController.getCategories);
router.get('/search', authMiddleware, neuronController.search);
router.get('/:id', authMiddleware, neuronController.getById);
router.post('/', authMiddleware, uploadMiddleware.single('image'), neuronController.create);
// Удаляем middleware загрузки изображений при обновлении нейрона
router.put('/:id', authMiddleware, neuronController.update);
router.delete('/:id', authMiddleware, neuronController.delete);

module.exports = router;