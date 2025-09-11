const db = require('../config/db');

class Subcategory {
  // Получить все подкатегории
  static async getAll() {
    try {
      const [rows] = await db.query(`
        SELECT 
          sc.*,
          c.name as category_name,
          c.color as category_color,
          COUNT(s.id) as skills_count
        FROM subcategories sc
        JOIN categories c ON sc.category_id = c.id
        LEFT JOIN skills s ON sc.id = s.subcategory_id
        GROUP BY sc.id
        ORDER BY c.name, sc.name
      `);
      return rows;
    } catch (error) {
      console.error('Ошибка получения подкатегорий:', error);
      return { error: 'Ошибка при получении подкатегорий из базы данных' };
    }
  }

  // Получить подкатегорию по ID
  static async getById(id) {
    try {
      const [rows] = await db.query(`
        SELECT 
          sc.*,
          c.name as category_name,
          c.color as category_color,
          COUNT(s.id) as skills_count
        FROM subcategories sc
        JOIN categories c ON sc.category_id = c.id
        LEFT JOIN skills s ON sc.id = s.subcategory_id
        WHERE sc.id = ?
        GROUP BY sc.id
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Ошибка получения подкатегории:', error);
      return { error: 'Ошибка при получении подкатегории из базы данных' };
    }
  }

  // Получить подкатегории по ID категории
  static async getByCategoryId(categoryId) {
    try {
      const [rows] = await db.query(`
        SELECT 
          sc.*,
          COUNT(s.id) as skills_count
        FROM subcategories sc
        LEFT JOIN skills s ON sc.id = s.subcategory_id
        WHERE sc.category_id = ?
        GROUP BY sc.id
        ORDER BY sc.name
      `, [categoryId]);
      return rows;
    } catch (error) {
      console.error('Ошибка получения подкатегорий по категории:', error);
      return { error: 'Ошибка при получении подкатегорий из базы данных' };
    }
  }

  // Создать новую подкатегорию
  static async create(subcategoryData) {
    try {
      const { category_id, name, color, description, position_x, position_y } = subcategoryData;
      const [result] = await db.query(`
        INSERT INTO subcategories (category_id, name, color, description, position_x, position_y)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [category_id, name, color || '#2ecc71', description, position_x || 0, position_y || 0]);
      
      return await this.getById(result.insertId);
    } catch (error) {
      console.error('Ошибка создания подкатегории:', error);
      return { error: 'Ошибка при создании подкатегории' };
    }
  }

  // Обновить подкатегорию
  static async update(id, subcategoryData) {
    try {
      const { category_id, name, color, description, position_x, position_y } = subcategoryData;
      await db.query(`
        UPDATE subcategories 
        SET category_id = ?, name = ?, color = ?, description = ?, position_x = ?, position_y = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [category_id, name, color, description, position_x, position_y, id]);
      
      return await this.getById(id);
    } catch (error) {
      console.error('Ошибка обновления подкатегории:', error);
      return { error: 'Ошибка при обновлении подкатегории' };
    }
  }

  // Удалить подкатегорию
  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM subcategories WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Ошибка удаления подкатегории:', error);
      return { error: 'Ошибка при удалении подкатегории' };
    }
  }
}

module.exports = Subcategory;
