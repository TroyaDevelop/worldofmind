const db = require('../config/db');

class Category {
  // Получить все категории
  static async getAll() {
    try {
      const [rows] = await db.query(`
        SELECT 
          c.*,
          COUNT(s.id) as neurons_count
        FROM categories c
        LEFT JOIN skills s ON c.id = s.category_id
        WHERE c.name IS NOT NULL 
          AND c.name != '' 
          AND TRIM(c.name) != ''
        GROUP BY c.id
        ORDER BY c.name
      `);
      return rows;
    } catch (error) {
      console.error('Ошибка получения категорий:', error);
      return { error: 'Ошибка при получении категорий из базы данных' };
    }
  }

  // Получить категорию по ID
  static async getById(id) {
    try {
      const [rows] = await db.query(`
        SELECT c.*, COUNT(s.id) as neurons_count
        FROM categories c
        LEFT JOIN skills s ON c.id = s.category_id
        WHERE c.id = ?
        GROUP BY c.id
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Ошибка получения категории:', error);
      return { error: 'Ошибка при получении категории из базы данных' };
    }
  }

  // Создать новую категорию
  static async create(categoryData) {
    try {
      const { name, color, description, position_x, position_y } = categoryData;
      const [result] = await db.query(`
        INSERT INTO categories (name, color, description, position_x, position_y)
        VALUES (?, ?, ?, ?, ?)
      `, [name, color || '#3498db', description, position_x || 0, position_y || 0]);
      
      return await this.getById(result.insertId);
    } catch (error) {
      console.error('Ошибка создания категории:', error);
      return { error: 'Ошибка при создании категории' };
    }
  }

  // Обновить категорию
  static async update(id, categoryData) {
    try {
      // Сначала получаем существующую категорию
      const existing = await this.getById(id);
      if (existing.error) {
        return existing;
      }

      // Используем существующие значения как значения по умолчанию
      const { 
        name = existing.name,
        color = existing.color,
        description = existing.description,
        position_x = existing.position_x,
        position_y = existing.position_y 
      } = categoryData;

      await db.query(`
        UPDATE categories 
        SET name = ?, color = ?, description = ?, position_x = ?, position_y = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [name, color, description, position_x, position_y, id]);
      
      return await this.getById(id);
    } catch (error) {
      console.error('Ошибка обновления категории:', error);
      return { error: 'Ошибка при обновлении категории' };
    }
  }

  // Удалить категорию
  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Ошибка удаления категории:', error);
      return { error: 'Ошибка при удалении категории' };
    }
  }

  // Получить все подкатегории для категории
  static async getSubcategories(categoryId) {
    try {
      const [rows] = await db.query(`
        SELECT 
          sc.*,
          COUNT(s.id) as neurons_count
        FROM subcategories sc
        LEFT JOIN skills s ON sc.id = s.subcategory_id
        WHERE sc.category_id = ?
        GROUP BY sc.id
        ORDER BY sc.name
      `, [categoryId]);
      return rows;
    } catch (error) {
      console.error('Ошибка получения подкатегорий:', error);
      return { error: 'Ошибка при получении подкатегорий из базы данных' };
    }
  }
}

module.exports = Category;
