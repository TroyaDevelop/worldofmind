const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // Регистрация нового пользователя
  static async register(username, password) {
    try {
      // Проверяем, существует ли пользователь с таким именем
      const [existingUsers] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      if (existingUsers.length > 0) {
        return { error: 'Пользователь с таким именем уже существует' };
      }
      
      // Хешируем пароль перед сохранением в базу данных
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Сохраняем пользователя в базу данных
      const [result] = await pool.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      
      // Возвращаем данные нового пользователя
      return {
        id: result.insertId,
        username: username
      };
    } catch (error) {
      console.error('Ошибка при регистрации пользователя:', error);
      return { error: 'Ошибка при регистрации пользователя' };
    }
  }

  // Вход пользователя (аутентификация)
  static async login(username, password) {
    try {
      // Ищем пользователя с указанным именем
      const [users] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      if (users.length === 0) {
        return { error: 'Пользователь не найден' };
      }
      
      const user = users[0];
      
      // Проверяем пароль
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return { error: 'Неверный пароль' };
      }
      
      // Возвращаем данные пользователя
      return {
        id: user.id,
        username: user.username
      };
    } catch (error) {
      console.error('Ошибка при входе пользователя:', error);
      return { error: 'Ошибка при входе пользователя' };
    }
  }

  // Получение пользователя по ID
  static async getById(id) {
    try {
      const [users] = await pool.query(
        'SELECT id, username, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      
      if (users.length === 0) {
        return { error: 'Пользователь не найден' };
      }
      
      return users[0];
    } catch (error) {
      console.error('Ошибка при получении пользователя по ID:', error);
      return { error: 'Ошибка при получении пользователя' };
    }
  }

  // Обновление пароля пользователя
  static async updatePassword(userId, currentPassword, newPassword) {
    try {
      // Получаем текущие данные пользователя
      const [users] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return { error: 'Пользователь не найден' };
      }
      
      const user = users[0];
      
      // Проверяем текущий пароль
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return { error: 'Неверный текущий пароль' };
      }
      
      // Хешируем новый пароль
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Обновляем пароль в базе данных
      await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      
      return { message: 'Пароль успешно изменен' };
    } catch (error) {
      console.error('Ошибка при обновлении пароля:', error);
      return { error: 'Ошибка при обновлении пароля' };
    }
  }
}

module.exports = User;