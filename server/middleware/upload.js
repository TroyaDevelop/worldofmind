const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Проверяем и создаем директорию для загрузки файлов, если она не существует
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настраиваем хранилище для загружаемых файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Создаем уникальное имя файла с оригинальным расширением
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  }
});

// Фильтр для проверки типов файлов
const fileFilter = (req, file, cb) => {
  // Разрешенные типы файлов для изображений
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    // Если тип файла подходит, принимаем его
    cb(null, true);
  } else {
    // Если тип файла не подходит, отклоняем его с ошибкой
    cb(new Error('Неподдерживаемый тип файла. Разрешены только изображения (JPEG, PNG, GIF, WEBP)'), false);
  }
};

// Настройка multer с заданными параметрами
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Максимальный размер файла: 5МБ
  }
});

// Middleware для обработки ошибок multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Обработка ошибок Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Размер файла превышает максимально допустимый (5МБ)' });
    }
    return res.status(400).json({ error: `Ошибка при загрузке файла: ${err.message}` });
  } else if (err) {
    // Обработка других ошибок
    return res.status(400).json({ error: err.message });
  }
  
  next();
};

module.exports = {
  upload,
  handleMulterError,
  single: (fieldName) => [upload.single(fieldName), handleMulterError]
};