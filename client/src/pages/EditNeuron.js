import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { getNeuronById, updateNeuron } from '../services/neuronService';
import { getCategoriesHierarchy } from '../services/categoryService';
import TipTapEditor from '../components/TipTapEditor';
import '../assets/styles/CommonStyles.css';

const EditNeuron = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);

  // Ссылка на экземпляр редактора TipTap
  const editorRef = React.useRef(null);

  // Инициализация формы с использованием Formik
  const formik = useFormik({
    initialValues: {
      name: '',
      category_id: '',
      subcategory_id: '',
      description: '',
      text: '',
      level: 'in_progress', // новое поле: степень изучения
      color: '#FDFF73', // по умолчанию "в процессе"
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
        // Диагностика времени
        console.time('updateNeuron');
        // Определяем цвет по степени изучения
        let color = '#FDFF73';
        if (values.level === 'mastered') color = '#67E667';
        if (values.level === 'postponed') color = '#e74c3c';
        const neuronData = { ...values, color };
        await updateNeuron(id, neuronData);
        console.timeEnd('updateNeuron');
        navigate(`/neurons/${id}`);
      } catch (err) {
        setError(err.message || 'Не удалось обновить нейрон');
      } finally {
        setIsLoading(false);
      }
    },
    enableReinitialize: true // Важно для повторной инициализации формы при получении данных с сервера
  });

  // Обновление подкатегорий при выборе категории
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === parseInt(selectedCategory));
      setSubcategories(category?.subcategories || []);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  // Загрузка данных нейрона и списка категорий при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем данные нейрона и категории параллельно
        const [neuron, categoriesData] = await Promise.all([
          getNeuronById(id),
          getCategoriesHierarchy()
        ]);
        
        // Устанавливаем значения формы из полученных данных
        formik.setValues({
          name: neuron.name || neuron.article || '', // поддержка старого поля
          category_id: neuron.category_id || '', 
          subcategory_id: neuron.subcategory_id || '',
          description: neuron.description || '',
          text: neuron.text || '',
          level: neuron.level || 'in_progress',
          color: neuron.color || '#FDFF73',
        });
        
        setCategories(categoriesData || []);
        
        // Устанавливаем выбранную категорию для загрузки подкатегорий
        if (neuron.category_id) {
          setSelectedCategory(neuron.category_id.toString());
        }
        
      } catch (err) {
        setError(err.message || 'Не удалось загрузить данные нейрона');
        console.error('Ошибка при загрузке данных:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id]); // Убираем formik из зависимостей

  // Удаляем обработчик изменения изображения
  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     formik.setFieldValue('image', file);
  //     
  //     // Создаем предпросмотр изображения
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setImagePreview(reader.result);
  //       setCurrentImageUrl(null); // Скрываем текущее изображение
  //     };
  //     reader.readAsDataURL(file);
  //   } else {
  //     formik.setFieldValue('image', null);
  //     setImagePreview(null);
  //   }
  // };
  
  // Обработчик изменения категории
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    formik.setFieldValue('category_id', categoryId);
    // Сбрасываем подкатегорию при смене категории
    formik.setFieldValue('subcategory_id', '');
  };
  
  // Обработчик изменения текста в редакторе TipTap
  const handleTextChange = (value) => {
    formik.setFieldValue('text', value);
  };

  // Отображение загрузки
  if (initialLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p>Загрузка данных нейрона...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Link to={`/neurons/${id}`} className="btn btn-outline-secondary">
          <FaArrowLeft className="me-2" /> Вернуться к нейрону
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="mb-0">Редактирование нейрона</h2>
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

            {/* Кнопки действий */}
            <div className="d-flex justify-content-end mt-4">
              <Link to={`/neurons/${id}`} className="btn btn-outline-secondary me-2" disabled={isLoading}>
                Отмена
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                <FaSave className="me-2" />
                {isLoading ? 'Сохранение...' : 'Обновить нейрон'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditNeuron;