const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
} = require('../controllers/categoryController');

// Маршруты для категорий
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', auth, createCategory);
router.put('/categories/:id', auth, updateCategory);
router.delete('/categories/:id', auth, deleteCategory);

// Маршруты для подкатегорий
router.get('/subcategories', getAllSubcategories);
router.post('/subcategories', auth, createSubcategory);
router.put('/subcategories/:id', auth, updateSubcategory);
router.delete('/subcategories/:id', auth, deleteSubcategory);

module.exports = router;
