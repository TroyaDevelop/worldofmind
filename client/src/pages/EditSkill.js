import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { getSkillById, updateSkill, getCategories } from '../services/skillService';
import TipTapEditor from '../components/TipTapEditor';
import api from '../services/api';

const EditSkill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [existingCategories, setExistingCategories] = useState([]);

  // Ссылка на экземпляр редактора TipTap
  const editorRef = React.useRef(null);

  // Инициализация формы с использованием Formik
  const formik = useFormik({
    initialValues: {
      article: '',
      category: '',
      description: '',
      text: '',
      level: 'in_progress', // новое поле: степень изучения
      color: '#FDFF73', // по умолчанию "в процессе"
      // Удаляем поле image: null
    },
    validationSchema: Yup.object({
      article: Yup.string()
        .required('Необходимо указать название навыка')
        .max(255, 'Название не должно превышать 255 символов'),
      category: Yup.string()
        .required('Необходимо указать категорию')
        .max(100, 'Категория не должна превышать 100 символов'),
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
        console.time('updateSkill');
        // Определяем цвет по степени изучения
        let color = '#FDFF73';
        if (values.level === 'mastered') color = '#67E667';
        if (values.level === 'postponed') color = '#e74c3c';
        const skillData = { ...values, color };
        await updateSkill(id, skillData);
        console.timeEnd('updateSkill');
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
        // Только если пользователь ещё не менял level вручную
        if (
          formik.values.article === '' &&
          formik.values.category === '' &&
          formik.values.description === '' &&
          formik.values.text === ''
        ) {
          formik.setValues({
            article: skill.article,
            category: skill.category,
            description: skill.description || '',
            text: skill.text || '',
            level: skill.level || 'in_progress',
            color: skill.color || '#FDFF73',
          });
        }
        
        setExistingCategories(categories || []);
        
        // Удаляем установку URL для изображения
        // if (skill.image) {
        //   setCurrentImageUrl(`http://localhost:5000/uploads/${skill.image}`);
        // }
      } catch (err) {
        setError(err.message || 'Не удалось загрузить данные навыка');
        console.error('Ошибка при загрузке данных:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, formik]);

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

            {/* Степень изучения */}
            <div className="mb-3">
              <label className="form-label">Степень изучения</label>
              <div className="d-flex gap-3">
                <div>
                  <input type="radio" id="level-mastered" name="level" value="mastered"
                    checked={formik.values.level === 'mastered'}
                    onChange={formik.handleChange} disabled={isLoading} />
                  <label htmlFor="level-mastered" style={{ color: '#67E667', marginLeft: 4 }}>Полностью изучено</label>
                </div>
                <div>
                  <input type="radio" id="level-inprogress" name="level" value="in_progress"
                    checked={formik.values.level === 'in_progress'}
                    onChange={formik.handleChange} disabled={isLoading} />
                  <label htmlFor="level-inprogress" style={{ color: '#FDFF73', marginLeft: 4 }}>В процессе</label>
                </div>
                <div>
                  <input type="radio" id="level-postponed" name="level" value="postponed"
                    checked={formik.values.level === 'postponed'}
                    onChange={formik.handleChange} disabled={isLoading} />
                  <label htmlFor="level-postponed" style={{ color: '#e74c3c', marginLeft: 4 }}>Обучение отложено</label>
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
                placeholder="Введите краткое описание навыка"
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
                placeholder="Введите содержание навыка"
              />
              <small className="text-muted">
                Используйте инструменты панели для форматирования текста
              </small>
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