import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSkillById, deleteSkill } from '../services/skillService';
import { FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';

const SkillDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Загрузка данных о навыке
  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const skillData = await getSkillById(id);
        setSkill(skillData);
      } catch (err) {
        setError(err.message || 'Не удалось загрузить данные навыка');
        console.error('Ошибка при загрузке навыка:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkill();
  }, [id]);

  // Обработчик удаления навыка
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteSkill(id);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Не удалось удалить навык');
      console.error('Ошибка при удалении навыка:', err);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Отображение загрузки
  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p>Загрузка навыка...</p>
        </div>
      </div>
    );
  }

  // Отображение ошибки
  if (error || !skill) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Произошла ошибка</h4>
          <p>{error || 'Навык не найден'}</p>
          <button 
            className="btn btn-outline-primary"
            onClick={() => navigate('/')}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Link to="/" className="btn btn-outline-secondary">
          <FaArrowLeft className="me-2" /> К списку навыков
        </Link>
      </div>

      {/* Заголовок и кнопки действий */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ borderLeft: `5px solid ${skill.color || '#3498db'}`, paddingLeft: '15px' }}>
          {skill.article}
        </h1>
        <div>
          <Link to={`/skills/${id}/edit`} className="btn btn-outline-primary me-2">
            <FaEdit className="me-2" /> Редактировать
          </Link>
          <button 
            className="btn btn-outline-danger" 
            onClick={() => setShowDeleteModal(true)}
          >
            <FaTrash className="me-2" /> Удалить
          </button>
        </div>
      </div>

      {/* Основная информация о навыке */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between">
          <span>
            <strong>Категория:</strong> {skill.category}
          </span>
          <span className="badge bg-secondary">
            ID: {skill.id}
          </span>
        </div>
        <div className="card-body">
          {skill.description && (
            <div className="mb-4">
              <p>{skill.description}</p>
            </div>
          )}

          {skill.text && (
            <div className="mt-4">
              <div 
                className="skill-content"
                dangerouslySetInnerHTML={{ __html: skill.text }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Подтверждение удаления</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  <p>Вы уверены, что хотите удалить навык "{skill.article}"?</p>
                  <p className="text-danger">Это действие нельзя будет отменить.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                  >
                    Отмена
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Удаление...' : 'Удалить навык'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            style={{ zIndex: 1040 }} 
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default SkillDetails;