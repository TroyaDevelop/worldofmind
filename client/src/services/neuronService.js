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

// Функция для получения всех нейронов
export const getAllNeurons = async () => {
  try {
    const response = await api.get('/neurons/public');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Ошибка сервера при получении нейронов');
    }
    throw error;
  }
};

// Функция для получения категорий
export const getCategories = async () => {
  try {
    const response = await api.get('/neurons/categories/public');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Не удалось получить категории');
    }
    throw error;
  }
};

// Функция для получения конкретного нейрона
export const getNeuronById = async (id) => {
  try {
    const response = await api.get(`/neurons/public/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Не удалось получить нейрон');
    }
    throw error;
  }
};

// Функция для создания нейрона
export const createNeuron = async (neuronData) => {
  try {
    // Обрабатываем base64-изображения в HTML перед отправкой
    const processedText = await processImagesInHtml(neuronData.text);
    
    // Создаем объект FormData для отправки данных, включая файлы
    const formData = new FormData();
    
    // Добавляем все текстовые поля
    formData.append('name', neuronData.name);
    formData.append('category_id', neuronData.category_id || '');
    formData.append('subcategory_id', neuronData.subcategory_id || '');
    formData.append('level', neuronData.level);
    
    if (neuronData.description) {
      formData.append('description', neuronData.description);
    }
    
    if (processedText) {
      formData.append('text', processedText);
    }
    
    if (neuronData.color) {
      formData.append('color', neuronData.color);
    }
    
    // Добавляем изображение, если оно есть
    if (neuronData.image) {
      formData.append('image', neuronData.image);
    }
    
    // Настраиваем заголовок для отправки FormData
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    const response = await api.post('/neurons', formData, config);
    return response.data.neuron;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Не удалось создать нейрон');
    }
    throw error;
  }
};

// Функция для обновления нейрона
export const updateNeuron = async (id, neuronData) => {
  try {
    // Обрабатываем base64-изображения в HTML перед отправкой
    const processedText = await processImagesInHtml(neuronData.text);
    
    // Вместо FormData используем обычный объект JSON
    const data = {
      name: neuronData.name, // Исправляем article на name
      category_id: neuronData.category_id || null,
      subcategory_id: neuronData.subcategory_id || null,
      description: neuronData.description || '',
      text: processedText || '',
      color: neuronData.color || '#3498db',
      level: neuronData.level || 'in_progress', // Добавляем поле level
      image: neuronData.image || null // Добавляем поле image
    };
    
    // Настраиваем заголовок для отправки JSON
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Выводим данные в консоль для отладки
    console.log('Отправляем данные на сервер:', data);
    
    const response = await api.put(`/neurons/${id}`, data, config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Не удалось обновить нейрон');
    }
    throw error;
  }
};

// Функция для удаления нейрона
export const deleteNeuron = async (id) => {
  try {
    const response = await api.delete(`/neurons/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Не удалось удалить нейрон');
    }
    throw error;
  }
};