const Neuron = require('../models/Neuron');
const fs = require('fs');
const path = require('path');

// Получение всех нейронов пользователя
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const neurons = await Neuron.getAllByUserId(userId);
    
    // Проверка на ошибки
    if (neurons.error) {
      return res.status(400).json({ error: neurons.error });
    }
    
    res.status(200).json(neurons);
  } catch (error) {
    console.error('Ошибка при получении нейронов:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении нейронов' });
  }
};

// Получение одного нейрона по ID
exports.getById = async (req, res) => {
  try {
    const userId = req.user.id;
    const neuronId = req.params.id;
    
    const neuron = await Neuron.getById(neuronId, userId);
    
    // Проверка на ошибки
    if (neuron.error) {
      return res.status(404).json({ error: neuron.error });
    }
    
    res.status(200).json(neuron);
  } catch (error) {
    console.error('Ошибка при получении нейрона:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении нейрона' });
  }
};

// Создание нового нейрона
exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, 
      article, // для обратной совместимости
      category, // для обратной совместимости
      category_id,
      subcategory_id,
      description, 
      text, 
      color,
      level 
    } = req.body;
    
    // Используем name или article для названия
    const neuronName = name || article;
    
    // Валидация данных
    if (!neuronName) {
      return res.status(400).json({ error: 'Необходимо указать название нейрона' });
    }
    
    // Валидация длины описания
    if (description && description.length > 200) {
      return res.status(400).json({ error: 'Описание не должно превышать 200 символов' });
    }
    
    // Формирование данных для создания
    const neuronData = {
      user_id: userId,
      name: neuronName,
      article: neuronName, // для обратной совместимости
      category: category || '', // используем переданную категорию
      category_id: category_id || null,
      subcategory_id: subcategory_id || null,
      description: description || '',
      text: text || '',
      color: color || '#3498db',
      level: level || 'in_progress',
      image: req.file ? req.file.filename : null
    };
    
    const createdNeuron = await Neuron.create(neuronData);
    
    // Проверка на ошибки
    if (createdNeuron.error) {
      return res.status(400).json({ error: createdNeuron.error });
    }
    
    // Возвращаем нейрон в ожидаемом клиентом формате
    res.status(201).json({ neuron: createdNeuron });
  } catch (error) {
    console.error('Ошибка при создании нейрона:', error);
    res.status(500).json({ error: 'Ошибка сервера при создании нейрона' });
  }
};

// Обновление нейрона
exports.update = async (req, res) => {
  console.time('server_updateNeuron');
  try {
    const userId = req.user.id;
    const neuronId = req.params.id;
    
    // Добавляем вывод отладочной информации
    console.log('Данные запроса на обновление:', req.body);
    console.log('ID нейрона:', neuronId);
    console.log('ID пользователя:', userId);
    
    const { 
      name,
      article, // для обратной совместимости
      category,
      category_id,
      subcategory_id,
      description, 
      text, 
      color, 
      level, // Добавляем level
      image 
    } = req.body;
    
    // Используем name или article для названия
    const neuronName = name || article;
    
    // Валидация данных
    if (!neuronName) {
      console.log('Ошибка валидации: name/article не указано');
      return res.status(400).json({ error: 'Необходимо указать название нейрона' });
    }
    
    // Валидация длины описания
    if (description && description.length > 200) {
      return res.status(400).json({ error: 'Описание не должно превышать 200 символов' });
    }
    
    // Получаем текущий нейрон для проверки наличия изображения
    console.log('Получаем существующий нейрон...');
    const existingNeuron = await Neuron.getById(neuronId, userId);
    if (existingNeuron.error) {
      console.log('Ошибка получения существующего нейрона:', existingNeuron.error);
      return res.status(404).json({ error: existingNeuron.error });
    }
    console.log('Существующий нейрон:', existingNeuron);
    
    // Формирование данных для обновления
    const neuronData = {
      name: neuronName.trim(),
      article: neuronName.trim(), // для обратной совместимости
      category: category || '', // используем переданную категорию
      category_id: category_id || null,
      subcategory_id: subcategory_id || null,
      description: description ? description.trim() : '',
      text: text || '',
      color: color || '#3498db',
      level: level || 'in_progress', // Добавляем level
      // Используем переданное изображение или сохраняем существующее
      image: image || existingNeuron.image
    };
    
    console.log('Данные для обновления:', neuronData);
    
    const updatedNeuron = await Neuron.update(neuronId, neuronData, userId);
    
    // Проверка на ошибки
    if (updatedNeuron.error) {
      console.log('Ошибка при обновлении в модели:', updatedNeuron.error);
      return res.status(400).json({ error: updatedNeuron.error });
    }
    
    console.log('Нейрон успешно обновлен:', updatedNeuron);
    res.status(200).json(updatedNeuron);
    console.timeEnd('server_updateNeuron');
  } catch (error) {
    console.error('Ошибка при обновлении нейрона:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Ошибка сервера при обновлении нейрона' });
    console.timeEnd('server_updateNeuron');
  }
};

// Удаление нейрона
exports.delete = async (req, res) => {
  try {
    const userId = req.user.id;
    const neuronId = req.params.id;
    
    // Получаем текущий нейрон для проверки наличия изображения
    const existingNeuron = await Neuron.getById(neuronId, userId);
    if (existingNeuron.error) {
      return res.status(404).json({ error: existingNeuron.error });
    }
    
    // Если у нейрона было изображение, удаляем его
    if (existingNeuron.image) {
      const imagePath = path.join(__dirname, '../uploads', existingNeuron.image);
      
      // Проверяем существование файла перед удалением
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    const result = await Neuron.delete(neuronId, userId);
    
    // Проверка на ошибки
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Ошибка при удалении нейрона:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении нейрона' });
  }
};

// Поиск нейронов по запросу
exports.search = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Необходимо указать запрос для поиска' });
    }
    
    const neurons = await Neuron.search(query, userId);
    
    // Проверка на ошибки
    if (neurons.error) {
      return res.status(400).json({ error: neurons.error });
    }
    
    res.status(200).json({ neurons: neurons });
  } catch (error) {
    console.error('Ошибка при поиске нейронов:', error);
    res.status(500).json({ error: 'Ошибка сервера при поиске нейронов' });
  }
};

// Получение всех категорий пользователя
exports.getCategories = async (req, res) => {
  try {
    // Если запрос к публичному маршруту, userId не требуется
    const userId = req.user ? req.user.id : null;
    
    const categories = await Neuron.getCategories(userId);
    
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

// Получить все нейрони (публичный метод)
exports.getAllNeurons = async (req, res) => {
  try {
    const neurons = await Neuron.getAll();
    
    // Проверка на ошибки
    if (neurons.error) {
      return res.status(500).json({ error: neurons.error });
    }
    
    // Проверяем, является ли результат массивом
    if (Array.isArray(neurons)) {
      console.log(`Возвращаем ${neurons.length} нейронов в ответе`);
      return res.status(200).json(neurons);
    } else {
      console.log('Нейрони не являются массивом:', neurons);
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error('Ошибка получения всех нейронов:', error);
    res.status(500).json({ error: 'Ошибка при получении нейронов' });
  }
};

// Получить нейрон по ID
exports.getNeuronById = async (req, res) => {
  try {
    const neuronId = req.params.id;
    const neuron = await Neuron.getById(neuronId);
    
    if (neuron.error) {
      return res.status(404).json({ error: neuron.error });
    }
    
    res.status(200).json(neuron);
  } catch (error) {
    console.error('Ошибка получения нейрона:', error);
    res.status(500).json({ error: 'Ошибка при получении нейрона' });
  }
};

// Создать новый нейрон
exports.createNeuron = async (req, res) => {
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
    
    const neuronData = {
      title,
      description,
      image_url,
      difficulty: difficulty || 'Средний',
      time_required: time_required || 'Не указано',
      prerequisites: prerequisites || 'Нет',
      user_id: req.user.id // Из middleware аутентификации
    };
    
    const neuron = await Neuron.create(neuronData);
    
    if (neuron.error) {
      return res.status(500).json({ error: neuron.error });
    }
    
    res.status(201).json(neuron);
  } catch (error) {
    console.error('Ошибка создания нейрона:', error);
    res.status(500).json({ error: 'Ошибка при создании нейрона' });
  }
};

// Удалить нейрон
exports.deleteNeuron = async (req, res) => {
  try {
    const neuronId = req.params.id;
    
    // Получаем данные нейрона для проверки владельца и удаления изображения
    const existingNeuron = await Neuron.getById(neuronId);
    if (existingNeuron.error) {
      return res.status(404).json({ error: existingNeuron.error });
    }
    
    // Удаляем нейрон
    const result = await Neuron.delete(neuronId, req.user.id);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    // Если у нейрона было изображение, удаляем его
    if (existingNeuron.image_url) {
      const imagePath = path.join(__dirname, '..', existingNeuron.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Ошибка удаления нейрона:', error);
    res.status(500).json({ error: 'Ошибка при удалении нейрона' });
  }
};

// Получить нейрони пользователя
exports.getUserNeurons = async (req, res) => {
  try {
    // Либо используем ID из параметра запроса, либо ID авторизованного пользователя
    const userId = req.params.userId || req.user.id;
    
    const neurons = await Neuron.getByUserId(userId);
    
    if (neurons.error) {
      return res.status(500).json({ error: neurons.error });
    }
    
    res.status(200).json(neurons);
  } catch (error) {
    console.error('Ошибка получения нейронов пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении нейронов пользователя' });
  }
};