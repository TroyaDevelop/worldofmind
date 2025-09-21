const db = require('../config/db');

class Neuron {
  // Получить все нейрони
  static async getAll() {
    try {
      const [rows] = await db.query(`
        SELECT 
          s.id,
          s.user_id,
          s.article,
          s.category,
          s.category_id,
          s.subcategory_id,
          s.description,
          s.text,
          s.color,
          s.level,
          s.image,
          s.position_x,
          s.position_y,
          s.created_at,
          s.updated_at,
          u.username,
          c.name as category_name,
          c.color as category_color,
          sc.name as subcategory_name,
          sc.color as subcategory_color
        FROM skills s 
        JOIN users u ON s.user_id = u.id 
        LEFT JOIN categories c ON s.category_id = c.id
        LEFT JOIN subcategories sc ON s.subcategory_id = sc.id
        ORDER BY s.created_at DESC
      `);
      
      // Проверяем, что найдены нейрони
      console.log(`Найдено нейронов: ${rows.length}`);
      
      return rows;
    } catch (error) {
      console.error('Ошибка получения всех нейронов:', error);
      return { error: 'Ошибка при получении нейронов из базы данных' };
    }
  }
  
  // Получить все нейрони по ID пользователя
  static async getAllByUserId(userId) {
    try {
      const [rows] = await db.query(`
        SELECT 
          s.*,
          u.username,
          c.name as category_name,
          c.color as category_color,
          sc.name as subcategory_name,
          sc.color as subcategory_color
        FROM skills s 
        JOIN users u ON s.user_id = u.id 
        LEFT JOIN categories c ON s.category_id = c.id
        LEFT JOIN subcategories sc ON s.subcategory_id = sc.id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
      `, [userId]);
      return rows;
    } catch (error) {
      console.error('Ошибка получения нейронов пользователя:', error);
      return { error: 'Ошибка при получении нейронов из базы данных' };
    }
  }

  // Получить нейрон по ID
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
        return { error: 'Нейрон не найден' };
      }
      
      return rows[0];
    } catch (error) {
      console.error('Ошибка получения нейрона по ID:', error);
      return { error: 'Ошибка при получении нейрона из базы данных' };
    }
  }
  
  // Получить все категории (с фильтром по пользователю, если указан userId)
  static async getCategories(userId = null) {
    try {
      let query = `
        SELECT DISTINCT category 
        FROM skills 
        WHERE category IS NOT NULL 
          AND category != '' 
          AND TRIM(category) != ''
      `;
      
      let params = [];
      
      // Если передан userId, добавляем условие проверки владельца
      if (userId) {
        query += ' AND user_id = ?';
        params.push(userId);
      }
      
      query += ' ORDER BY category';
      
      const [rows] = await db.query(query, params);
      
      // Преобразуем результат в массив категорий
      const categories = rows.map(row => row.category);
      
      return categories;
    } catch (error) {
      console.error('Ошибка получения категорий нейронов:', error);
      return { error: 'Ошибка при получении категорий из базы данных' };
    }
  }

  // Создать новый нейрон
  static async create(neuronData) {
    try {
      // Используем правильные имена полей из таблицы skills (сохраняем таблицу для совместимости)
      const { 
        name,
        article, 
        category, 
        category_id, 
        subcategory_id, 
        description, 
        text, 
        color, 
        image, 
        position_x, 
        position_y, 
        user_id 
      } = neuronData;
      
      // В запросе указываем только поля, которые есть в таблице
      const [result] = await db.query(`
        INSERT INTO skills (
          article, category, category_id, subcategory_id, 
          description, text, color, level, image, position_x, position_y, user_id
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name || article,
        category, 
        category_id, 
        subcategory_id, 
        description, 
        text, 
        color,
        neuronData.level || 'in_progress', 
        image, 
        position_x || 0, 
        position_y || 0, 
        user_id
      ]);
      
      if (result.affectedRows === 0) {
        return { error: 'Ошибка создания нейрона' };
      }
      
      return { id: result.insertId, ...neuronData };
    } catch (error) {
      console.error('Ошибка создания нейрона:', error);
      return { error: 'Ошибка при создании нейрона в базе данных: ' + error.message };
    }
  }

  // Обновить нейрон
  static async update(id, neuronData, userId) {
    try {
      // Сначала проверяем, принадлежит ли нейрон этому пользователю
      const [neuronCheck] = await db.query('SELECT user_id FROM skills WHERE id = ?', [id]);
      
      if (neuronCheck.length === 0) {
        return { error: 'Нейрон не найден' };
      }
      
      if (neuronCheck[0].user_id !== userId) {
        return { error: 'Вы не можете редактировать нейрон другого пользователя' };
      }
      
      // Используем правильные имена полей из таблицы skills (сохраняем таблицу для совместимости)
      const { name, article, category, category_id, subcategory_id, description, text, color, level, image } = neuronData;
      
      // Используем name или article для обратной совместимости
      const neuronName = name || article;
      
      const [result] = await db.query(`
        UPDATE skills 
        SET article = ?, category = ?, category_id = ?, subcategory_id = ?,
            description = ?, text = ?, color = ?, level = ?, image = ?,
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [neuronName, category, category_id, subcategory_id, description, text, color, level || 'in_progress', image, id]);
      
      if (result.affectedRows === 0) {
        return { error: 'Ошибка обновления нейрона' };
      }
      
      return { id, ...neuronData };
    } catch (error) {
      console.error('Ошибка обновления нейрона:', error);
      return { error: 'Ошибка при обновлении нейрона в базе данных: ' + error.message };
    }
  }

  // Удалить нейрон
  static async delete(id, userId) {
    try {
      // Сначала проверяем, принадлежит ли нейрон этому пользователю
      const [neuronCheck] = await db.query('SELECT user_id FROM skills WHERE id = ?', [id]);
      
      if (neuronCheck.length === 0) {
        return { error: 'Нейрон не найден' };
      }
      
      if (neuronCheck[0].user_id !== userId) {
        return { error: 'Вы не можете удалить нейрон другого пользователя' };
      }
      
      const [result] = await db.query('DELETE FROM skills WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return { error: 'Ошибка удаления нейрона' };
      }
      
      return { message: 'Нейрон успешно удален' };
    } catch (error) {
      console.error('Ошибка удаления нейрона:', error);
      return { error: 'Ошибка при удалении нейрона из базы данных' };
    }
  }

  // Получить нейрони пользователя
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
      console.error('Ошибка получения нейронов пользователя:', error);
      return { error: 'Ошибка при получении нейронов пользователя из базы данных' };
    }
  }
}

module.exports = Neuron;