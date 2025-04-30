const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

// Роут для загрузки изображений из редактора
router.post('/upload', authMiddleware, uploadMiddleware.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }
    
    // Возвращаем путь к загруженному файлу
    const filePath = `/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${filePath}`;
    
    return res.status(200).json({ 
      success: true, 
      file: {
        url: fullUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    return res.status(500).json({ error: 'Ошибка при загрузке изображения' });
  }
});

module.exports = router;