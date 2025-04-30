-- Создание базы данных
CREATE DATABASE IF NOT EXISTS worldofmind DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE worldofmind;

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Создание таблицы навыков
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  article VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  text TEXT,
  color VARCHAR(20) DEFAULT '#ffffff',
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для оптимизации поиска
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_article ON skills(article);
CREATE INDEX idx_skills_category ON skills(category);