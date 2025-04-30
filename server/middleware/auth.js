const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware для проверки аутентификации через JWT токен
module.exports = (req, res, next) => {
  try {
    // Получаем заголовок авторизации
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Не предоставлен токен авторизации' });
    }
    
    // Извлекаем токен из заголовка
    const token = authHeader.split(' ')[1];
    
    try {
      // Проверяем и декодируем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Добавляем данные пользователя в объект запроса
      req.user = {
        id: decoded.id,
        username: decoded.username
      };
      
      // Передаем управление следующему обработчику
      next();
    } catch (jwtError) {
      // Если с токеном что-то не так
      console.error('Ошибка проверки токена:', jwtError);
      return res.status(401).json({ error: 'Недействительный токен авторизации' });
    }
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(500).json({ error: 'Ошибка сервера при аутентификации' });
  }
};