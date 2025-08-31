const mysql = require('mysql2/promise');
require('dotenv').config();

// Создаем пул соединений с базой данных MariaDB
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'worldofmind',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Настройки для MariaDB
  charset: 'utf8mb4',
  timezone: 'local'
});

// Проверка соединения при запуске
(async () => {
  try {
    const connection = await pool.getConnection();
    // Проверяем версию MariaDB
    const [rows] = await connection.execute('SELECT VERSION() as version');
    const version = rows[0].version;
    
    if (version.toLowerCase().includes('mariadb')) {
      console.log(`Успешное соединение с MariaDB версии: ${version}`);
    } else {
      console.log(`Соединение с базой данных установлено. Версия: ${version}`);
    }
    
    connection.release();
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
  }
})();

module.exports = pool;