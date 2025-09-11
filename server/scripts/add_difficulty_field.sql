-- Добавление поля сложности навыка
USE worldofmind;

-- Добавляем поле difficulty к таблице skills
ALTER TABLE skills 
ADD COLUMN difficulty TINYINT UNSIGNED DEFAULT 5,
ADD INDEX idx_skills_difficulty (difficulty);

-- Также добавляем поле name для нового API
ALTER TABLE skills 
ADD COLUMN name VARCHAR(255) DEFAULT NULL;

-- Обновляем существующие записи: копируем article в name
UPDATE skills SET name = article WHERE name IS NULL;
