const Skill = require('../models/Skill');
const fs = require('fs');
const path = require('path');

// Получение всех навыков пользователя
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const skills = await Skill.getAllByUserId(userId);
    
    // Проверка на ошибки
    if (skills.error) {
      return res.status(400).json({ error: skills.error });
    }
    
    res.status(200).json(skills);
  } catch (error) {
    console.error('Ошибка при получении навыков:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении навыков' });
  }
};

// Получение одного навыка по ID
exports.getById = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = req.params.id;
    
    const skill = await Skill.getById(skillId, userId);
    
    // Проверка на ошибки
    if (skill.error) {
      return res.status(404).json({ error: skill.error });
    }
    
    res.status(200).json(skill);
  } catch (error) {
    console.error('Ошибка при получении навыка:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении навыка' });
  }
};

// Создание нового навыка
exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { article, category, description, text, color } = req.body;
    
    // Валидация данных
    if (!article || !category) {
      return res.status(400).json({ error: 'Необходимо указать название и категорию навыка' });
    }
    
    // Валидация длины описания
    if (description && description.length > 200) {
      return res.status(400).json({ error: 'Описание не должно превышать 200 символов' });
    }
    
    // Формирование данных для создания
    const skillData = {
      user_id: userId, // Используем user_id вместо userId
      article,
      category,
      description: description || '',
      text: text || '',
      color: color || '#3498db',
      image: req.file ? req.file.filename : null
    };
    
    const createdSkill = await Skill.create(skillData);
    
    // Проверка на ошибки
    if (createdSkill.error) {
      return res.status(400).json({ error: createdSkill.error });
    }
    
    // Возвращаем навык в ожидаемом клиентом формате
    res.status(201).json({ skill: createdSkill });
  } catch (error) {
    console.error('Ошибка при создании навыка:', error);
    res.status(500).json({ error: 'Ошибка сервера при создании навыка' });
  }
};

// Обновление навыка
exports.update = async (req, res) => {
  console.time('server_updateSkill');
  try {
    const userId = req.user.id;
    const skillId = req.params.id;
    
    // Добавляем вывод отладочной информации
    console.log('Данные запроса на обновление:', req.body);
    console.log('ID навыка:', skillId);
    console.log('ID пользователя:', userId);
    
    const { article, category, description, text, color, image } = req.body;
    
    // Валидация данных
    if (!article || !category) {
      console.log('Ошибка валидации: article =', article, 'category =', category);
      return res.status(400).json({ error: 'Необходимо указать название и категорию навыка' });
    }
    
    // Валидация длины описания
    if (description && description.length > 200) {
      return res.status(400).json({ error: 'Описание не должно превышать 200 символов' });
    }
    
    // Получаем текущий навык для проверки наличия изображения
    console.log('Получаем существующий навык...');
    const existingSkill = await Skill.getById(skillId, userId);
    if (existingSkill.error) {
      console.log('Ошибка получения существующего навыка:', existingSkill.error);
      return res.status(404).json({ error: existingSkill.error });
    }
    console.log('Существующий навык:', existingSkill);
    
    // Формирование данных для обновления
    const skillData = {
      article: article.trim(),
      category: category.trim(),
      description: description ? description.trim() : '',
      text: text || '',
      color: color || '#3498db',
      // Используем переданное изображение или сохраняем существующее
      image: image || existingSkill.image
    };
    
    console.log('Данные для обновления:', skillData);
    
    const updatedSkill = await Skill.update(skillId, skillData, userId);
    
    // Проверка на ошибки
    if (updatedSkill.error) {
      console.log('Ошибка при обновлении в модели:', updatedSkill.error);
      return res.status(400).json({ error: updatedSkill.error });
    }
    
    console.log('Навык успешно обновлен:', updatedSkill);
    res.status(200).json(updatedSkill);
    console.timeEnd('server_updateSkill');
  } catch (error) {
    console.error('Ошибка при обновлении навыка:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Ошибка сервера при обновлении навыка' });
    console.timeEnd('server_updateSkill');
  }
};

// Удаление навыка
exports.delete = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = req.params.id;
    
    // Получаем текущий навык для проверки наличия изображения
    const existingSkill = await Skill.getById(skillId, userId);
    if (existingSkill.error) {
      return res.status(404).json({ error: existingSkill.error });
    }
    
    // Если у навыка было изображение, удаляем его
    if (existingSkill.image) {
      const imagePath = path.join(__dirname, '../uploads', existingSkill.image);
      
      // Проверяем существование файла перед удалением
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    const result = await Skill.delete(skillId, userId);
    
    // Проверка на ошибки
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Ошибка при удалении навыка:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении навыка' });
  }
};

// Поиск навыков по запросу
exports.search = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Необходимо указать запрос для поиска' });
    }
    
    const skills = await Skill.search(query, userId);
    
    // Проверка на ошибки
    if (skills.error) {
      return res.status(400).json({ error: skills.error });
    }
    
    res.status(200).json({ skills: skills });
  } catch (error) {
    console.error('Ошибка при поиске навыков:', error);
    res.status(500).json({ error: 'Ошибка сервера при поиске навыков' });
  }
};

// Получение всех категорий пользователя
exports.getCategories = async (req, res) => {
  try {
    // Если запрос к публичному маршруту, userId не требуется
    const userId = req.user ? req.user.id : null;
    
    const categories = await Skill.getCategories(userId);
    
    // Проверка на ошибки
    if (categories.error) {
      return res.status(400).json({ error: categories.error });
    }
    
    res.status(200).json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении категорий' });
  }
};

// Получить все навыки (публичный метод)
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.getAll();
    
    // Проверка на ошибки
    if (skills.error) {
      return res.status(500).json({ error: skills.error });
    }
    
    // Проверяем, является ли результат массивом
    if (Array.isArray(skills)) {
      console.log(`Возвращаем ${skills.length} навыков в ответе`);
      return res.status(200).json(skills);
    } else {
      console.log('Навыки не являются массивом:', skills);
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error('Ошибка получения всех навыков:', error);
    res.status(500).json({ error: 'Ошибка при получении навыков' });
  }
};

// Получить навык по ID
exports.getSkillById = async (req, res) => {
  try {
    const skillId = req.params.id;
    const skill = await Skill.getById(skillId);
    
    if (skill.error) {
      return res.status(404).json({ error: skill.error });
    }
    
    res.status(200).json(skill);
  } catch (error) {
    console.error('Ошибка получения навыка:', error);
    res.status(500).json({ error: 'Ошибка при получении навыка' });
  }
};

// Создать новый навык
exports.createSkill = async (req, res) => {
  try {
    const { title, description, difficulty, time_required, prerequisites } = req.body;
    
    // Проверка обязательных полей
    if (!title || !description) {
      return res.status(400).json({ error: 'Название и описание обязательны для заполнения' });
    }
    
    // Получение пути к загруженному изображению, если есть
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    const skillData = {
      title,
      description,
      image_url,
      difficulty: difficulty || 'Средний',
      time_required: time_required || 'Не указано',
      prerequisites: prerequisites || 'Нет',
      user_id: req.user.id // Из middleware аутентификации
    };
    
    const skill = await Skill.create(skillData);
    
    if (skill.error) {
      return res.status(500).json({ error: skill.error });
    }
    
    res.status(201).json(skill);
  } catch (error) {
    console.error('Ошибка создания навыка:', error);
    res.status(500).json({ error: 'Ошибка при создании навыка' });
  }
};

// Удалить навык
exports.deleteSkill = async (req, res) => {
  try {
    const skillId = req.params.id;
    
    // Получаем данные навыка для проверки владельца и удаления изображения
    const existingSkill = await Skill.getById(skillId);
    if (existingSkill.error) {
      return res.status(404).json({ error: existingSkill.error });
    }
    
    // Удаляем навык
    const result = await Skill.delete(skillId, req.user.id);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    // Если у навыка было изображение, удаляем его
    if (existingSkill.image_url) {
      const imagePath = path.join(__dirname, '..', existingSkill.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Ошибка удаления навыка:', error);
    res.status(500).json({ error: 'Ошибка при удалении навыка' });
  }
};

// Получить навыки пользователя
exports.getUserSkills = async (req, res) => {
  try {
    // Либо используем ID из параметра запроса, либо ID авторизованного пользователя
    const userId = req.params.userId || req.user.id;
    
    const skills = await Skill.getByUserId(userId);
    
    if (skills.error) {
      return res.status(500).json({ error: skills.error });
    }
    
    res.status(200).json(skills);
  } catch (error) {
    console.error('Ошибка получения навыков пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении навыков пользователя' });
  }
};