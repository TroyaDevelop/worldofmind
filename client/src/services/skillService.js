import api from './api';

// Функция для конвертации base64 в File
const base64ToFile = (base64String, filename) => {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// Функция для извлечения и загрузки base64-изображений из HTML
const processImagesInHtml = async (htmlContent) => {
  if (!htmlContent) return htmlContent;
  
  // Находим все base64-изображения в HTML
  const base64ImageRegex = /<img[^>]+src="data:image\/[^;"]+;base64,[^"]*"[^>]*>/g;
  const base64Images = htmlContent.match(base64ImageRegex) || [];
  
  if (base64Images.length === 0) {
    return htmlContent;
  }
  
  let processedHtml = htmlContent;
  
  // Обрабатываем каждое base64-изображение
  for (let i = 0; i < base64Images.length; i++) {
    const imgTag = base64Images[i];
    const srcMatch = imgTag.match(/src="([^"]+)"/);
    
    if (srcMatch) {
      const base64Src = srcMatch[1];
      const filename = `embedded_image_${Date.now()}_${i}.png`;
      
      try {
        // Конвертируем base64 в файл
        const imageFile = base64ToFile(base64Src, filename);
        
        // Загружаем файл на сервер
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadResponse = await api.post('/uploads/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Заменяем base64-ссылку на серверную
        const serverImageUrl = uploadResponse.data.file.url;
        processedHtml = processedHtml.replace(base64Src, serverImageUrl);
        
      } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
        // Оставляем base64, если загрузка не удалась
      }
    }
  }
  
  return processedHtml;
};

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

// Функция для создания навыка
export const createSkill = async (skillData) => {
  try {
    // Обрабатываем base64-изображения в HTML перед отправкой
    const processedText = await processImagesInHtml(skillData.text);
    
    // Создаем объект FormData для отправки данных, включая файлы
    const formData = new FormData();
    
    // Добавляем все текстовые поля
    formData.append('name', skillData.name);
    formData.append('category_id', skillData.category_id || '');
    formData.append('subcategory_id', skillData.subcategory_id || '');
    formData.append('level', skillData.level);
    
    if (skillData.description) {
      formData.append('description', skillData.description);
    }
    
    if (processedText) {
      formData.append('text', processedText);
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
    // Обрабатываем base64-изображения в HTML перед отправкой
    const processedText = await processImagesInHtml(skillData.text);
    
    // Вместо FormData используем обычный объект JSON
    const data = {
      name: skillData.name, // Исправляем article на name
      category_id: skillData.category_id || null,
      subcategory_id: skillData.subcategory_id || null,
      description: skillData.description || '',
      text: processedText || '',
      color: skillData.color || '#3498db',
      level: skillData.level || 'in_progress', // Добавляем поле level
      image: skillData.image || null // Добавляем поле image
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