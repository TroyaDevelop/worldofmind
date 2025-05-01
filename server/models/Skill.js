const db = require('../config/db');

class Skill {
  // Получить все навыки
  static async getAll() {
    try {
      const [rows] = await db.query(`
        SELECT 
          s.id,
          s.user_id,
          s.article,
          s.category,
          s.description,
          s.text,
          s.color,
          s.image,
          s.created_at,
          s.updated_at,
          u.username 
        FROM skills s 
        JOIN users u ON s.user_id = u.id 
        ORDER BY s.created_at DESC
      `);
      
      // Проверяем, что найдены навыки
      console.log(`Найдено навыков: ${rows.length}`);
      
      return rows;
    } catch (error) {
      console.error('Ошибка получения всех навыков:', error);
      return { error: 'Ошибка при получении навыков из базы данных' };
    }
  }
  
  // Получить все навыки по ID пользователя
  static async getAllByUserId(userId) {
    try {
      const [rows] = await db.query(`
        SELECT s.*, u.username 
        FROM skills s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
      `, [userId]);
      return rows;
    } catch (error) {
      console.error('Ошибка получения навыков пользователя:', error);
      return { error: 'Ошибка при получении навыков из базы данных' };
    }
  }

  // Получить навык по ID
  static async getById(id, userId = null) {
    try {
      let query = `
        SELECT s.*, u.username 
        FROM skills s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.id = ?
      `;
      
      let params = [id];
      
      // Если передан userId, добавляем условие проверки владельца
      if (userId) {
        query += ' AND s.user_id = ?';
        params.push(userId);
      }
      
      const [rows] = await db.query(query, params);
      
      if (rows.length === 0) {
        return { error: 'Навык не найден' };
      }
      
      return rows[0];
    } catch (error) {
      console.error('Ошибка получения навыка по ID:', error);
      return { error: 'Ошибка при получении навыка из базы данных' };
    }
  }

  // Поиск навыков по ключевому слову
  static async search(query, userId = null) {
    try {
      const searchParam = `%${query}%`;
      let sqlQuery = `
        SELECT s.*, u.username 
        FROM skills s 
        JOIN users u ON s.user_id = u.id 
        WHERE (s.article LIKE ? OR s.description LIKE ? OR s.text LIKE ? OR s.category LIKE ?)
      `;
      
      let params = [searchParam, searchParam, searchParam, searchParam];
      
      // Если передан userId, добавляем условие проверки владельца
      if (userId) {
        sqlQuery += ' AND s.user_id = ?';
        params.push(userId);
      }
      
      sqlQuery += ' ORDER BY s.created_at DESC';
      
      const [rows] = await db.query(sqlQuery, params);
      
      return rows;
    } catch (error) {
      console.error('Ошибка поиска навыков:', error);
      return { error: 'Ошибка при поиске навыков в базе данных' };
    }
  }
  
  // Получить все категории (с фильтром по пользователю, если указан userId)
  static async getCategories(userId = null) {
    try {
      let query = `
        SELECT DISTINCT category 
        FROM skills 
      `;
      
      let params = [];
      
      // Если передан userId, добавляем условие проверки владельца
      if (userId) {
        query += ' WHERE user_id = ?';
        params.push(userId);
      }
      
      query += ' ORDER BY category';
      
      const [rows] = await db.query(query, params);
      
      // Преобразуем результат в массив категорий
      const categories = rows.map(row => row.category);
      
      return categories;
    } catch (error) {
      console.error('Ошибка получения категорий навыков:', error);
      return { error: 'Ошибка при получении категорий из базы данных' };
    }
  }

  // Создать новый навык
  static async create(skillData) {
    try {
      // Используем правильные имена полей из таблицы skills
      const { article, category, description, text, color, image, user_id } = skillData;
      
      // В запросе указываем оба поля: user_id и userId
      const [result] = await db.query(`
        INSERT INTO skills (article, category, description, text, color, image, user_id, userId) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [article, category, description, text, color, image, user_id, user_id]); // Используем одинаковое значение для обоих полей
      
      if (result.affectedRows === 0) {
        return { error: 'Ошибка создания навыка' };
      }
      
      return { id: result.insertId, ...skillData };
    } catch (error) {
      console.error('Ошибка создания навыка:', error);
      return { error: 'Ошибка при создании навыка в базе данных: ' + error.message };
    }
  }

  // Обновить навык
  static async update(id, skillData, userId) {
    try {
      // Сначала проверяем, принадлежит ли навык этому пользователю
      const [skillCheck] = await db.query('SELECT user_id FROM skills WHERE id = ?', [id]);
      
      if (skillCheck.length === 0) {
        return { error: 'Навык не найден' };
      }
      
      if (skillCheck[0].user_id !== userId) {
        return { error: 'Вы не можете редактировать навык другого пользователя' };
      }
      
      // Используем правильные имена полей из таблицы skills
      const { article, category, description, text, color, image } = skillData;
      
      const [result] = await db.query(`
        UPDATE skills 
        SET article = ?, category = ?, description = ?, 
            text = ?, color = ?, image = ?,
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [article, category, description, text, color, image, id]);
      
      if (result.affectedRows === 0) {
        return { error: 'Ошибка обновления навыка' };
      }
      
      return { id, ...skillData };
    } catch (error) {
      console.error('Ошибка обновления навыка:', error);
      return { error: 'Ошибка при обновлении навыка в базе данных: ' + error.message };
    }
  }

  // Удалить навык
  static async delete(id, userId) {
    try {
      // Сначала проверяем, принадлежит ли навык этому пользователю
      const [skillCheck] = await db.query('SELECT user_id FROM skills WHERE id = ?', [id]);
      
      if (skillCheck.length === 0) {
        return { error: 'Навык не найден' };
      }
      
      if (skillCheck[0].user_id !== userId) {
        return { error: 'Вы не можете удалить навык другого пользователя' };
      }
      
      const [result] = await db.query('DELETE FROM skills WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return { error: 'Ошибка удаления навыка' };
      }
      
      return { message: 'Навык успешно удален' };
    } catch (error) {
      console.error('Ошибка удаления навыка:', error);
      return { error: 'Ошибка при удалении навыка из базы данных' };
    }
  }

  // Получить навыки пользователя
  static async getByUserId(userId) {
    try {
      const [rows] = await db.query(`
        SELECT s.*, u.username 
        FROM skills s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.user_id = ? 
        ORDER BY s.created_at DESC
      `, [userId]);
      
      return rows;
    } catch (error) {
      console.error('Ошибка получения навыков пользователя:', error);
      return { error: 'Ошибка при получении навыков пользователя из базы данных' };
    }
  }
}

module.exports = Skill;