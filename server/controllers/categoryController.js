const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// Получить все категории
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    
    if (categories.error) {
      return res.status(500).json({ error: categories.error });
    }
    
    // Получаем подкатегории для каждой категории
    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await Subcategory.getByCategoryId(category.id);
        return {
          ...category,
          subcategories: subcategories.error ? [] : subcategories
        };
      })
    );
    
    res.json(categoriesWithSubcategories);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Получить категорию по ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.getById(id);
    
    if (category?.error) {
      return res.status(500).json({ error: category.error });
    }
    
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    // Получаем подкатегории для категории
    const subcategories = await Subcategory.getByCategoryId(id);
    
    res.json({
      ...category,
      subcategories: subcategories.error ? [] : subcategories
    });
  } catch (error) {
    console.error('Ошибка получения категории:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Создать новую категорию
const createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    
    // Валидация обязательных полей
    if (!categoryData.name) {
      return res.status(400).json({ error: 'Название категории обязательно' });
    }
    
    const newCategory = await Category.create(categoryData);
    
    if (newCategory.error) {
      return res.status(500).json({ error: newCategory.error });
    }
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Обновить категорию
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = req.body;
    
    const updatedCategory = await Category.update(id, categoryData);
    
    if (updatedCategory.error) {
      return res.status(500).json({ error: updatedCategory.error });
    }
    
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Ошибка обновления категории:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Удалить категорию
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Category.delete(id);
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    if (!result) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    res.json({ message: 'Категория успешно удалена' });
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Получить все подкатегории
const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.getAll();
    
    if (subcategories.error) {
      return res.status(500).json({ error: subcategories.error });
    }
    
    res.json(subcategories);
  } catch (error) {
    console.error('Ошибка получения подкатегорий:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Создать новую подкатегорию
const createSubcategory = async (req, res) => {
  try {
    const subcategoryData = req.body;
    
    // Валидация обязательных полей
    if (!subcategoryData.name || !subcategoryData.category_id) {
      return res.status(400).json({ error: 'Название подкатегории и ID категории обязательны' });
    }
    
    const newSubcategory = await Subcategory.create(subcategoryData);
    
    if (newSubcategory.error) {
      return res.status(500).json({ error: newSubcategory.error });
    }
    
    res.status(201).json(newSubcategory);
  } catch (error) {
    console.error('Ошибка создания подкатегории:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Обновить подкатегорию
const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategoryData = req.body;
    
    const updatedSubcategory = await Subcategory.update(id, subcategoryData);
    
    if (updatedSubcategory.error) {
      return res.status(500).json({ error: updatedSubcategory.error });
    }
    
    if (!updatedSubcategory) {
      return res.status(404).json({ error: 'Подкатегория не найдена' });
    }
    
    res.json(updatedSubcategory);
  } catch (error) {
    console.error('Ошибка обновления подкатегории:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Удалить подкатегорию
const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Subcategory.delete(id);
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    if (!result) {
      return res.status(404).json({ error: 'Подкатегория не найдена' });
    }
    
    res.json({ message: 'Подкатегория успешно удалена' });
  } catch (error) {
    console.error('Ошибка удаления подкатегории:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
};
