-- Обновление пустых категорий навыков на "Разное"
UPDATE skills 
SET category = 'Разное' 
WHERE category IS NULL 
   OR category = '' 
   OR TRIM(category) = '';

-- Вывод количества обновленных записей
SELECT 
    COUNT(*) as updated_skills_count 
FROM skills 
WHERE category = 'Разное';
