const pool = require('../config/db');

// Получить настройки пользователя
const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { setting_name } = req.query;

    let query = 'SELECT setting_name, setting_value FROM user_settings WHERE user_id = ?';
    let params = [userId];

    if (setting_name) {
      query += ' AND setting_name = ?';
      params.push(setting_name);
    }

    const [rows] = await pool.execute(query, params);
    
    // Преобразуем в удобный формат
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_name] = row.setting_value;
    });

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Ошибка при получении настроек:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении настроек пользователя' 
    });
  }
};

// Сохранить настройку пользователя
const saveUserSetting = async (req, res) => {
  try {
    const userId = req.user.id;
    const { setting_name, setting_value } = req.body;

    if (!setting_name || setting_value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать название и значение настройки'
      });
    }

    // Используем INSERT ... ON DUPLICATE KEY UPDATE для обновления существующих настроек
    const query = `
      INSERT INTO user_settings (user_id, setting_name, setting_value) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
      setting_value = VALUES(setting_value),
      updated_at = CURRENT_TIMESTAMP
    `;

    await pool.execute(query, [userId, setting_name, JSON.stringify(setting_value)]);

    res.json({ 
      success: true, 
      message: 'Настройка сохранена успешно' 
    });
  } catch (error) {
    console.error('Ошибка при сохранении настройки:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при сохранении настройки пользователя' 
    });
  }
};

// Сохранить множественные настройки пользователя
const saveUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Необходимо передать объект настроек'
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const [setting_name, setting_value] of Object.entries(settings)) {
        const query = `
          INSERT INTO user_settings (user_id, setting_name, setting_value) 
          VALUES (?, ?, ?) 
          ON DUPLICATE KEY UPDATE 
          setting_value = VALUES(setting_value),
          updated_at = CURRENT_TIMESTAMP
        `;
        await connection.execute(query, [userId, setting_name, JSON.stringify(setting_value)]);
      }

      await connection.commit();
      connection.release();

      res.json({ 
        success: true, 
        message: 'Настройки сохранены успешно' 
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Ошибка при сохранении настроек:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при сохранении настроек пользователя' 
    });
  }
};

// Удалить настройку пользователя
const deleteUserSetting = async (req, res) => {
  try {
    const userId = req.user.id;
    const { setting_name } = req.params;

    const query = 'DELETE FROM user_settings WHERE user_id = ? AND setting_name = ?';
    const [result] = await pool.execute(query, [userId, setting_name]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Настройка не найдена'
      });
    }

    res.json({ 
      success: true, 
      message: 'Настройка удалена успешно' 
    });
  } catch (error) {
    console.error('Ошибка при удалении настройки:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при удалении настройки пользователя' 
    });
  }
};

module.exports = {
  getUserSettings,
  saveUserSetting,
  saveUserSettings,
  deleteUserSetting
};
