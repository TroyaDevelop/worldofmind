-- Создание базы данных World of Mind
-- Этот скрипт создает полную структуру базы данных для приложения

-- Создание базы данных
CREATE DATABASE IF NOT EXISTS worldofmind DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE worldofmind;

-- Удаляем существующие таблицы если они есть (для полного пересоздания)
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS users;

-- Создание таблицы пользователей
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы навыков
CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  article VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  text LONGTEXT,
  color VARCHAR(20) DEFAULT '#ffffff',
  image VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_skills_user_id (user_id),
  INDEX idx_skills_article (article),
  INDEX idx_skills_category (category),
  INDEX idx_skills_created_at (created_at),
  FULLTEXT KEY idx_skills_text_search (article, description, text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание тестового пользователя (по желанию)
-- Пароль: test123 (будет захеширован в приложении)
-- INSERT INTO users (username, password) VALUES ('testuser', '$2a$10$example.hash.here');

-- Вставка тестовых данных навыков (по желанию)
-- INSERT INTO skills (user_id, article, category, description, text, color) VALUES 
-- (1, 'JavaScript Основы', 'Программирование', 'Изучение основ JavaScript', 'Детальное описание изучения JavaScript...', '#f39c12'),
-- (1, 'React.js', 'Фронтенд', 'Изучение библиотеки React', 'Подробное изучение React компонентов...', '#61dafb');

-- Проверка созданной структуры
SHOW TABLES;
DESCRIBE users;
DESCRIBE skills;