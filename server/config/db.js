const mysql = require('mysql2/promise');
require('dotenv').config();

// Создаем пул соединений с базой данных
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'worldofmind',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Проверка соединения при запуске
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Успешное соединение с базой данных MySQL');
    connection.release();
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
  }
})();

module.exports = pool;