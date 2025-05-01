import api from './api';

// Функция для получения всех навыков
export const getAllSkills = async () => {
  try {
    const response = await api.get('/skills/public');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Ошибка сервера при получении навыков');
    }
    throw error;
  }
};

// Функция для получения категорий
export const getCategories = async () => {
  try {
    const response = await api.get('/skills/categories/public');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Не удалось получить категории');
    }
    throw error;
  }
};

// Функция для получения конкретного навыка
export const getSkillById = async (id) => {
  try {
    const response = await api.get(`/skills/public/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Не удалось получить навык');
    }
    throw error;
  }
};

// Функция для поиска навыков
export const searchSkills = async (query) => {
  try {
    const response = await api.get(`/skills/search/public?q=${encodeURIComponent(query)}`);
    return response.data.skills || response.data; // Обрабатываем оба возможных формата ответа
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Не удалось выполнить поиск');
    }
    throw error;
  }
};

// Функция для создания навыка
export const createSkill = async (skillData) => {
  try {
    // Создаем объект FormData для отправки данных, включая файлы
    const formData = new FormData();
    
    // Добавляем все текстовые поля
    formData.append('article', skillData.article);
    formData.append('category', skillData.category);
    
    if (skillData.description) {
      formData.append('description', skillData.description);
    }
    
    if (skillData.text) {
      formData.append('text', skillData.text);
    }
    
    if (skillData.color) {
      formData.append('color', skillData.color);
    }
    
    // Добавляем изображение, если оно есть
    if (skillData.image) {
      formData.append('image', skillData.image);
    }
    
    // Настраиваем заголовок для отправки FormData
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    const response = await api.post('/skills', formData, config);
    return response.data.skill;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Не удалось создать навык');
    }
    throw error;
  }
};

// Функция для обновления навыка
export const updateSkill = async (id, skillData) => {
  try {
    // Вместо FormData используем обычный объект JSON
    const data = {
      article: skillData.article,
      category: skillData.category,
      description: skillData.description || '',
      text: skillData.text || '',
      color: skillData.color || '#3498db'
    };
    
    // Настраиваем заголовок для отправки JSON
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Выводим данные в консоль для отладки
    console.log('Отправляем данные на сервер:', data);
    
    const response = await api.put(`/skills/${id}`, data, config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Не удалось обновить навык');
    }
    throw error;
  }
};

// Функция для удаления навыка
export const deleteSkill = async (id) => {
  try {
    const response = await api.delete(`/skills/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Не удалось удалить навык');
    }
    throw error;
  }
};