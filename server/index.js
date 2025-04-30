const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Импортируем маршруты
const authRoutes = require('./routes/auth');
const skillRoutes = require('./routes/skills');
const uploadRoutes = require('./routes/uploads');

// Инициализируем приложение Express
const app = express();
const PORT = process.env.PORT || 5000;

// Настройка middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статический маршрут для загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Настройка маршрутов API
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/uploads', uploadRoutes);

// Обрабатываем все остальные маршруты для SPA в продакшене
if (process.env.NODE_ENV === 'production') {
  // Статический маршрут для React-приложения
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Все неизвестные маршруты направляют на React-приложение
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Произошла ошибка сервера' });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
