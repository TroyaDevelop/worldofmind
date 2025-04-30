import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { createSkill, getCategories } from '../services/skillService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../services/api';

const AddSkill = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingCategories, setExistingCategories] = useState([]);
  
  // Ссылка на экземпляр редактора Quill
  const quillRef = useRef(null);

  // Функция для загрузки изображений через редактор
  const imageHandler = useCallback(() => {
    // Создаем невидимый input для выбора файла
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    // Обрабатываем выбор файла
    input.onchange = async () => {
      try {
        const file = input.files[0];
        if (!file) return;

        // Проверка размера файла (до 5 МБ)
        if (file.size > 5 * 1024 * 1024) {
          alert('Размер файла превышает 5МБ. Выберите файл меньшего размера.');
          return;
        }

        // Отображаем статус загрузки
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertText(range.index, 'Загрузка изображения... ', 'italic');

        // Создаём объект FormData для отправки файла
        const formData = new FormData();
        formData.append('image', file);

        // Отправляем файл на сервер - исправляем URL
        const response = await api.post('/uploads/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Удаляем текст "Загрузка изображения..."
        quill.deleteText(range.index, 'Загрузка изображения... '.length);

        // Вставляем изображение
        const imgUrl = response.data.file.url;
        quill.insertEmbed(range.index, 'image', imgUrl);

        // Перемещаем курсор после изображения
        quill.setSelection(range.index + 1);
      } catch (error) {
        console.error('Ошибка при загрузке изображения:', error);
        alert('Произошла ошибка при загрузке изображения. Пожалуйста, попробуйте еще раз.');
      }
    };
  }, []);

  // Конфигурация модулей редактора Quill
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        'image': imageHandler
      }
    }
  };

  // Форматы, поддерживаемые редактором
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  // Загрузка существующих категорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategories();
        setExistingCategories(categories || []);
      } catch (err) {
        console.error('Ошибка при загрузке категорий:', err);
      }
    };

    fetchCategories();
  }, []);

  // Настройка валидации формы
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
        const result = await createSkill(values);
        
        // После успешного создания перенаправляем на страницу навыка
        navigate(`/skills/${result.id}`);
      } catch (err) {
        setError(err.message || 'Не удалось создать навык');
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Обработчик изменения изображения
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue('image', file);
      
      // Создаем предпросмотр изображения
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
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

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Link to="/" className="btn btn-outline-secondary">
          <FaArrowLeft className="me-2" /> К списку навыков
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="mb-0">Добавление нового навыка</h2>
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
                ref={quillRef}
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
                Загрузите изображение (JPEG, PNG, GIF, WEBP)
              </small>

              {/* Предпросмотр изображения */}
              {imagePreview && (
                <div className="mt-3">
                  <img 
                    src={imagePreview} 
                    alt="Предпросмотр" 
                    className="img-thumbnail" 
                    style={{ maxHeight: '200px' }} 
                  />
                </div>
              )}
            </div>

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
                {isLoading ? 'Сохранение...' : 'Сохранить навык'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSkill;