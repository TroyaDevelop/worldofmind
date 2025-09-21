import React, { useState, useEffect } from 'react';
import '../assets/styles/NeuronDetails.css';
import '../assets/styles/CommonStyles.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getNeuronById, deleteNeuron } from '../services/neuronService';
import { FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';

const NeuronDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [neuron, setNeuron] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Загрузка данных о нейроне
  useEffect(() => {
    const fetchNeuron = async () => {
      try {
        const neuronData = await getNeuronById(id);
        setNeuron(neuronData);
      } catch (err) {
        setError(err.message || 'Не удалось загрузить данные нейрона');
        console.error('Ошибка при загрузке нейрона:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNeuron();
  }, [id]);

  // Обработчик удаления нейрона
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteNeuron(id);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Не удалось удалить нейрон');
      console.error('Ошибка при удалении нейрона:', err);
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
          <p>Загрузка нейрона...</p>
        </div>
      </div>
    );
  }

  // Отображение ошибки
  if (error || !neuron) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Произошла ошибка</h4>
          <p>{error || 'Нейрон не найден'}</p>
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
          <FaArrowLeft className="me-2" /> К списку нейронов
        </Link>
      </div>

      {/* Заголовок и кнопки действий */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 
          className="neuron-header"
          style={{ borderLeft: `5px solid ${neuron.color || '#3498db'}` }}
        >
          {neuron.article}
        </h1>
        <div>
          <Link to={`/neurons/${id}/edit`} className="btn btn-outline-primary me-2">
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

      {/* Основная информация о нейроне */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between">
          <span>
            <strong>Категория:</strong> {neuron.category}
          </span>
          <span className="badge bg-secondary">
            ID: {neuron.id}
          </span>
        </div>
        <div className="card-body">

          {neuron.text && (
            <div>
              <div 
                className="neuron-content"
                dangerouslySetInnerHTML={{ __html: neuron.text }}
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
                  <p>Вы уверены, что хотите удалить нейрон "{neuron.article}"?</p>
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
                    {deleting ? 'Удаление...' : 'Удалить нейрон'}
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

export default NeuronDetails;