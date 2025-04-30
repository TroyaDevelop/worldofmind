import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { getSkillById, updateSkill, getCategories } from '../services/skillService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditSkill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingCategories, setExistingCategories] = useState([]);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  // Конфигурация модулей редактора Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }]
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image',
    'color', 'background',
    'align'
  ];

  // Настройка formik
  const formik = useFormik({
    initialValues: {
      article: '',
      category: '',
      description: '',
      text: '',
      color: '#3498db',
      image: null
    },
    validationSchema: Yup.object({
      article: Yup.string()
        .required('Необходимо указать название навыка')
        .max(255, 'Название не должно превышать 255 символов'),
      category: Yup.string()
        .required('Необходимо указать категорию')
        .max(100, 'Категория не должна превышать 100 символов'),
      description: Yup.string()
        .max(500, 'Описание не должно превышать 500 символов'),
      text: Yup.string(),
      color: Yup.string()
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Отправка данных на сервер
        const result = await updateSkill(id, values);
        
        // После успешного обновления перенаправляем на страницу навыка
        navigate(`/skills/${id}`);
      } catch (err) {
        setError(err.message || 'Не удалось обновить навык');
      } finally {
        setIsLoading(false);
      }
    },
    enableReinitialize: true // Важно для повторной инициализации формы при получении данных с сервера
  });

  // Загрузка данных навыка и списка категорий при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем данные навыка и категории параллельно
        const [skill, categories] = await Promise.all([
          getSkillById(id),
          getCategories()
        ]);
        
        // Устанавливаем значения формы из полученных данных
        formik.setValues({
          article: skill.article,
          category: skill.category,
          description: skill.description || '',
          text: skill.text || '',
          color: skill.color || '#3498db',
          image: null // Изображение должно быть загружено отдельно пользователем
        });
        
        setExistingCategories(categories || []);
        
        // Если у навыка есть изображение, устанавливаем URL для отображения
        if (skill.image) {
          setCurrentImageUrl(`http://localhost:5000/uploads/${skill.image}`);
        }
      } catch (err) {
        setError(err.message || 'Не удалось загрузить данные навыка');
        console.error('Ошибка при загрузке данных:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Обработчик изменения изображения
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue('image', file);
      
      // Создаем предпросмотр изображения
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setCurrentImageUrl(null); // Скрываем текущее изображение
      };
      reader.readAsDataURL(file);
    } else {
      formik.setFieldValue('image', null);
      setImagePreview(null);
    }
  };
  
  // Обработчик изменения текста в редакторе Quill
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
          <p>Загрузка данных навыка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Link to={`/skills/${id}`} className="btn btn-outline-secondary">
          <FaArrowLeft className="me-2" /> Вернуться к навыку
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="mb-0">Редактирование навыка</h2>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <form onSubmit={formik.handleSubmit}>
            {/* Название навыка */}
            <div className="mb-3">
              <label htmlFor="article" className="form-label">Название навыка *</label>
              <input
                type="text"
                id="article"
                name="article"
                className={`form-control ${formik.touched.article && formik.errors.article ? 'is-invalid' : ''}`}
                placeholder="Введите название навыка"
                value={formik.values.article}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isLoading}
              />
              {formik.touched.article && formik.errors.article && (
                <div className="invalid-feedback">{formik.errors.article}</div>
              )}
            </div>

            {/* Категория */}
            <div className="mb-3">
              <label htmlFor="category" className="form-label">Категория *</label>
              <div className="input-group">
                <input
                  type="text"
                  id="category"
                  name="category"
                  className={`form-control ${formik.touched.category && formik.errors.category ? 'is-invalid' : ''}`}
                  placeholder="Введите или выберите категорию"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  list="categories-list"
                  disabled={isLoading}
                />
                <datalist id="categories-list">
                  {existingCategories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                {formik.touched.category && formik.errors.category && (
                  <div className="invalid-feedback">{formik.errors.category}</div>
                )}
              </div>
              <small className="text-muted">
                Вы можете выбрать существующую категорию или создать новую
              </small>
            </div>

            {/* Цвет */}
            <div className="mb-3">
              <label htmlFor="color" className="form-label">Цвет</label>
              <div className="input-group">
                <input
                  type="color"
                  id="color"
                  name="color"
                  className="form-control form-control-color"
                  value={formik.values.color}
                  onChange={formik.handleChange}
                  disabled={isLoading}
                  title="Выберите цвет"
                />
                <input
                  type="text"
                  className="form-control"
                  value={formik.values.color}
                  onChange={(e) => formik.setFieldValue('color', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <small className="text-muted">
                Цвет будет использоваться для обозначения навыка
              </small>
            </div>

            {/* Описание */}
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Краткое описание</label>
              <textarea
                id="description"
                name="description"
                className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                placeholder="Введите краткое описание навыка"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows={3}
                disabled={isLoading}
              />
              {formik.touched.description && formik.errors.description && (
                <div className="invalid-feedback">{formik.errors.description}</div>
              )}
            </div>

            {/* Текст с форматированием (React-Quill) */}
            <div className="mb-3">
              <label htmlFor="text" className="form-label">Содержание</label>
              <ReactQuill
                theme="snow"
                value={formik.values.text}
                onChange={handleTextChange}
                modules={modules}
                formats={formats}
                placeholder="Введите содержание навыка"
                readOnly={isLoading}
              />
              <small className="text-muted">
                Используйте инструменты панели для форматирования текста
              </small>
            </div>

            {/* Изображение */}
            <div className="mb-3">
              <label htmlFor="image" className="form-label">Изображение</label>
              <input
                type="file"
                id="image"
                name="image"
                className="form-control"
                onChange={handleImageChange}
                accept="image/*"
                disabled={isLoading}
              />
              <small className="text-muted">
                Оставьте поле пустым, если не хотите менять изображение
              </small>

              {/* Предпросмотр нового изображения */}
              {imagePreview && (
                <div className="mt-3">
                  <h6>Новое изображение:</h6>
                  <img 
                    src={imagePreview} 
                    alt="Предпросмотр" 
                    className="img-thumbnail" 
                    style={{ maxHeight: '200px' }} 
                  />
                </div>
              )}

              {/* Текущее изображение */}
              {currentImageUrl && !imagePreview && (
                <div className="mt-3">
                  <h6>Текущее изображение:</h6>
                  <img 
                    src={currentImageUrl} 
                    alt="Текущее изображение" 
                    className="img-thumbnail" 
                    style={{ maxHeight: '200px' }} 
                  />
                </div>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="d-flex justify-content-end mt-4">
              <Link to={`/skills/${id}`} className="btn btn-outline-secondary me-2" disabled={isLoading}>
                Отмена
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                <FaSave className="me-2" />
                {isLoading ? 'Сохранение...' : 'Обновить навык'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSkill;