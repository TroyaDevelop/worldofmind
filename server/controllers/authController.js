const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Регистрация нового пользователя
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Необходимо указать имя пользователя и пароль' });
    }
    
    // Регистрируем пользователя через модель User
    const result = await User.register(username, password);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    // Создаем JWT токен для авторизации
    const token = jwt.sign(
      { id: result.id, username: result.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    // Отправляем ответ с данными пользователя и токеном
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: result.id,
        username: result.username
      },
      token
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
  }
};

// Вход пользователя
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Попытка входа:', { username, receivedPassword: !!password });
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Необходимо указать имя пользователя и пароль' });
    }
    
    // Выполняем аутентификацию через модель User
    const result = await User.login(username, password);
    
    if (result.error) {
      console.log('Ошибка входа:', result.error);
      return res.status(401).json({ error: result.error });
    }
    
    console.log('Успешный вход пользователя:', username);
    
    // Создаем JWT токен для авторизации
    const token = jwt.sign(
      { id: result.id, username: result.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    // Отправляем ответ с данными пользователя и токеном
    res.status(200).json({
      message: 'Авторизация успешна',
      user: {
        id: result.id,
        username: result.username
      },
      token
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Ошибка сервера при авторизации' });
  }
};

// Получение информации о текущем пользователе
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user устанавливается middleware аутентификации
    const userId = req.user.id;
    
    // Получаем данные пользователя из базы данных
    const user = await User.getById(userId);
    
    if (user.error) {
      return res.status(404).json({ error: user.error });
    }
    
    // Отправляем информацию о пользователе
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении информации о пользователе' });
  }
};

// Изменение пароля пользователя
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Необходимо указать текущий и новый пароли' });
    }
    
    const result = await User.updatePassword(userId, currentPassword, newPassword);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Ошибка при изменении пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера при изменении пароля' });
  }
};