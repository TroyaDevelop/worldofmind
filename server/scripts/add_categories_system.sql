-- Расширение базы данных для поддержки иерархических категорий
-- Добавляем таблицы для категорий и подкатегорий

USE worldofmind;

-- Создание таблицы категорий
CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#3498db',
  description TEXT,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы подкатегорий
CREATE TABLE subcategories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#2ecc71',
  description TEXT,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_subcategories_category_id (category_id),
  INDEX idx_subcategories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Добавляем новые поля к таблице skills
ALTER TABLE skills 
ADD COLUMN category_id INT UNSIGNED DEFAULT NULL,
ADD COLUMN subcategory_id INT UNSIGNED DEFAULT NULL,
ADD COLUMN position_x FLOAT DEFAULT 0,
ADD COLUMN position_y FLOAT DEFAULT 0,
ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
ADD FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL,
ADD INDEX idx_skills_category_id (category_id),
ADD INDEX idx_skills_subcategory_id (subcategory_id);

-- Вставляем базовые категории для примера
INSERT INTO categories (name, color, description) VALUES
('Программирование', '#3498db', 'Все навыки связанные с разработкой программного обеспечения'),
('Дизайн', '#e74c3c', 'Графический дизайн, UI/UX и визуальное искусство'),
('Менеджмент', '#f39c12', 'Управление проектами и командами'),
('Маркетинг', '#9b59b6', 'Продвижение и реклама');

-- Вставляем подкатегории для программирования
INSERT INTO subcategories (category_id, name, color, description) VALUES
(1, 'Frontend', '#5dade2', 'Разработка пользовательских интерфейсов'),
(1, 'Backend', '#58d68d', 'Серверная разработка и API'),
(1, 'Mobile', '#f7dc6f', 'Мобильная разработка'),
(1, 'Моддинг', '#bb8fce', 'Создание модификаций для игр и приложений'),
(1, 'DevOps', '#85c1e9', 'Автоматизация развертывания и инфраструктура');

-- Вставляем подкатегории для дизайна
INSERT INTO subcategories (category_id, name, color, description) VALUES
(2, 'UI/UX', '#ec7063', 'Пользовательский опыт и интерфейсы'),
(2, '3D Graphics', '#af7ac5', '3D моделирование и анимация'),
(2, 'Illustration', '#f8c471', 'Иллюстрация и концепт-арт');
