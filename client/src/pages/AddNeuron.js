import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { createNeuron } from '../services/neuronService';
import { getCategoriesHierarchy } from '../services/categoryService';
import TipTapEditor from '../components/TipTapEditor';
import '../assets/styles/CommonStyles.css';

const AddNeuron = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  
  // Ссылка на экземпляр редактора TipTap
  const editorRef = useRef(null);

  // Загрузка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategoriesHierarchy();
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Ошибка при загрузке категорий:', err);
      }
    };

    fetchCategories();
  }, []);

  // Обновление подкатегорий при выборе категории
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === parseInt(selectedCategory));
      setSubcategories(category?.subcategories || []);
      // Сбрасываем выбранную подкатегорию при смене категории
      formik.setFieldValue('subcategory_id', '');
    } else {
      setSubcategories([]);
      formik.setFieldValue('subcategory_id', '');
    }
  }, [selectedCategory, categories]);

  // Настройка валидации формы
  const formik = useFormik({
    initialValues: {
      name: '',
      category_id: '',
      subcategory_id: '',
      description: '',
      text: '',
      level: 'in_progress',
      color: '#FDFF73',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Необходимо указать название нейрона')
        .max(255, 'Название не должно превышать 255 символов'),
      category_id: Yup.string()
        .required('Необходимо выбрать категорию'),
      description: Yup.string()
        .max(200, 'Описание не должно превышать 200 символов'),
      text: Yup.string(),
      level: Yup.string().required('Выберите степень изучения'),
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError(null);
        // Определяем цвет по степени изучения
        let color = '#FDFF73';
        if (values.level === 'mastered') color = '#67E667';
        if (values.level === 'postponed') color = '#e74c3c';
        const neuronData = { ...values, color };
        // Отправка данных на сервер
        const result = await createNeuron(neuronData);
        
        // После успешного создания перенаправляем на страницу нейрона
        if (result && result.id) {
          navigate(`/neurons/${result.id}`);
        } else {
          // Если нет ID, перенаправляем на главную страницу
          navigate('/');
        }
      } catch (err) {
        setError(err.message || 'Не удалось создать нейрон');
      } finally {
        setIsLoading(false);
      }
    }
  });

  // ...existing code...
  
  // Обработчик изменения категории
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    formik.setFieldValue('category_id', categoryId);
  };

  // Обработчик изменения текста в редакторе TipTap
  const handleTextChange = (value) => {
    formik.setFieldValue('text', value);
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Link to="/" className="btn btn-outline-secondary">
          <FaArrowLeft className="me-2" /> К списку нейронов
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="mb-0">Добавление нового нейрона</h2>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <form onSubmit={formik.handleSubmit}>
            {/* Название нейрона */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Название нейрона *</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                placeholder="Введите название нейрона"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isLoading}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="invalid-feedback">{formik.errors.name}</div>
              )}
            </div>

            {/* Категория */}
            <div className="mb-3">
              <label htmlFor="category_id" className="form-label">Категория *</label>
              <div className="input-group">
                <select
                  id="category_id"
                  name="category_id"
                  className={`form-control ${formik.touched.category_id && formik.errors.category_id ? 'is-invalid' : ''}`}
                  value={formik.values.category_id}
                  onChange={handleCategoryChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formik.touched.category_id && formik.errors.category_id && (
                  <div className="invalid-feedback">{formik.errors.category_id}</div>
                )}
              </div>
              <small className="text-muted">
                Выберите категорию из списка. 
                Для управления категориями перейдите в <Link to="/settings">настройки</Link>.
              </small>
            </div>

            {/* Подкатегория */}
            {subcategories.length > 0 && (
              <div className="mb-3">
                <label htmlFor="subcategory_id" className="form-label">Подкатегория</label>
                <div className="input-group">
                  <select
                    id="subcategory_id"
                    name="subcategory_id"
                    className="form-control"
                    value={formik.values.subcategory_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                  >
                    <option value="">Выберите подкатегорию (необязательно)</option>
                    {subcategories.map(subcategory => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
                <small className="text-muted">
                  Подкатегория не обязательна для заполнения.
                </small>
              </div>
            )}

            {/* Степень изучения */}
            <div className="mb-3">
              <label className="form-label">Степень изучения</label>
              <div className="d-flex gap-3">
                <div>
                  <input type="radio" id="level-mastered" name="level" value="mastered"
                    checked={formik.values.level === 'mastered'}
                    onChange={formik.handleChange} disabled={isLoading} />
                  <label htmlFor="level-mastered" className="level-label level-label-mastered">Полностью изучено</label>
                </div>
                <div>
                  <input type="radio" id="level-inprogress" name="level" value="in_progress"
                    checked={formik.values.level === 'in_progress'}
                    onChange={formik.handleChange} disabled={isLoading} />
                  <label htmlFor="level-inprogress" className="level-label level-label-inprogress">В процессе</label>
                </div>
                <div>
                  <input type="radio" id="level-postponed" name="level" value="postponed"
                    checked={formik.values.level === 'postponed'}
                    onChange={formik.handleChange} disabled={isLoading} />
                  <label htmlFor="level-postponed" className="level-label level-label-postponed">Обучение отложено</label>
                </div>
              </div>
              {formik.touched.level && formik.errors.level && (
                <div className="text-danger small">{formik.errors.level}</div>
              )}
            </div>

            {/* Описание */}
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Краткое описание
              </label>
              <textarea
                id="description"
                name="description"
                className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                placeholder="Введите краткое описание нейрона"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows={3}
                disabled={isLoading}
                maxLength={200}
              />
              <div className="d-flex justify-content-between align-items-start mt-1">
                <div>
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-danger small">{formik.errors.description}</div>
                  )}
                </div>
                <small className={`text-end ${formik.values.description.length > 180 ? 'text-warning' : formik.values.description.length === 200 ? 'text-danger' : 'text-muted'}`}>
                  {200 - formik.values.description.length} символов осталось
                </small>
              </div>
            </div>

            {/* Текст с форматированием (TipTap Editor) */}
            <div className="mb-3">
              <label htmlFor="text" className="form-label">Содержание</label>
              <TipTapEditor
                ref={editorRef}
                value={formik.values.text}
                onChange={handleTextChange}
                placeholder="Введите содержание нейрона"
              />
              <small className="text-muted">
                Используйте инструменты панели для форматирования текста
              </small>
            </div>

            {/* Поле изображения удалено по запросу пользователя */}

            {/* Кнопки действий */}
            <div className="d-flex justify-content-end mt-4">
              <Link to="/" className="btn btn-outline-secondary me-2" disabled={isLoading}>
                Отмена
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                <FaSave className="me-2" />
                {isLoading ? 'Сохранение...' : 'Сохранить нейрон'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNeuron;
// Нет вызова formik.setValues — ничего менять не нужно, форма работает корректно, если не добавлять setValues.