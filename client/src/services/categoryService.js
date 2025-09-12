import api from './api';

// Категории
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    let categories = response.data || [];
    
    // Фильтруем пустые и невалидные категории
    categories = categories.filter(category => 
      category && 
      typeof category === 'string' && 
      category.trim() !== ''
    );
    
    return categories;
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    throw error;
  }
};

// Получить иерархические категории для настроек (с фильтрацией пустых)
export const getCategoriesHierarchy = async () => {
  try {
    console.log('getCategoriesHierarchy: делаем запрос к /categories');
    const response = await api.get('/categories');
    console.log('getCategoriesHierarchy: raw response.data:', response.data);
    
    let categories = response.data || [];
    
    // Фильтруем пустые категории и подкатегории
    categories = categories.filter(category => 
      category && 
      category.name && 
      typeof category.name === 'string' && 
      category.name.trim() !== ''
    ).map(category => ({
      ...category,
      subcategories: (category.subcategories || []).filter(subcategory =>
        subcategory && 
        subcategory.name && 
        typeof subcategory.name === 'string' && 
        subcategory.name.trim() !== ''
      )
    }));
    
    console.log('getCategoriesHierarchy: filtered categories:', categories);
    return categories;
  } catch (error) {
    console.error('Ошибка получения иерархических категорий:', error);
    throw error;
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения категории:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления категории:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    throw error;
  }
};

// Подкатегории
export const getSubcategories = async () => {
  try {
    const response = await api.get('/subcategories');
    return response.data;
  } catch (error) {
    console.error('Ошибка получения подкатегорий:', error);
    throw error;
  }
};

export const createSubcategory = async (subcategoryData) => {
  try {
    const response = await api.post('/subcategories', subcategoryData);
    return response.data;
  } catch (error) {
    console.error('Ошибка создания подкатегории:', error);
    throw error;
  }
};

export const updateSubcategory = async (id, subcategoryData) => {
  try {
    const response = await api.put(`/subcategories/${id}`, subcategoryData);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления подкатегории:', error);
    throw error;
  }
};

export const deleteSubcategory = async (id) => {
  try {
    const response = await api.delete(`/subcategories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления подкатегории:', error);
    throw error;
  }
};
