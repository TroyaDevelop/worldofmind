import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCog, FaCheck } from 'react-icons/fa';
import { 
  getCategoriesHierarchy,
  createCategory, 
  createSubcategory, 
  updateCategory, 
  updateSubcategory, 
  deleteCategory,
  deleteSubcategory 
} from '../services/categoryService';
import '../assets/styles/Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('hierarchy');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Состояния для создания новых элементов
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showNewSubcategoryForm, setShowNewSubcategoryForm] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  
  // Состояния для редактирования
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editSubcategoryName, setEditSubcategoryName] = useState('');

  // Загрузка категорий
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getCategoriesHierarchy();
      setCategories(data || []);
    } catch (err) {
      setError('Ошибка при загрузке категорий');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Функция для отметки изменений
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  // Создание новой категории
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      setIsLoading(true);
      await createCategory({
        name: newCategoryName.trim(),
        color: '#3498db'
      });
      
      setNewCategoryName('');
      setShowNewCategoryForm(false);
      await fetchCategories();
      markAsChanged();
    } catch (err) {
      setError('Ошибка при создании категории');
    } finally {
      setIsLoading(false);
    }
  };

  // Создание новой подкатегории
  const handleCreateSubcategory = async (categoryId) => {
    if (!newSubcategoryName.trim()) return;
    
    try {
      setIsLoading(true);
      await createSubcategory({
        name: newSubcategoryName.trim(),
        category_id: categoryId,
        color: '#2ecc71'
      });
      
      setNewSubcategoryName('');
      setShowNewSubcategoryForm(null);
      await fetchCategories();
      markAsChanged();
    } catch (err) {
      setError('Ошибка при создании подкатегории');
      console.error('Ошибка создания подкатегории:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Редактирование категории
  const handleEditCategory = async (categoryId) => {
    if (!editCategoryName.trim()) return;
    
    try {
      setIsLoading(true);
      await updateCategory(categoryId, {
        name: editCategoryName.trim()
      });
      
      setEditingCategory(null);
      setEditCategoryName('');
      await fetchCategories();
      markAsChanged();
    } catch (err) {
      setError('Ошибка при редактировании категории');
    } finally {
      setIsLoading(false);
    }
  };

  // Редактирование подкатегории
  const handleEditSubcategory = async (subcategoryId) => {
    if (!editSubcategoryName.trim()) return;
    
    try {
      setIsLoading(true);
      await updateSubcategory(subcategoryId, {
        name: editSubcategoryName.trim()
      });
      
      setEditingSubcategory(null);
      setEditSubcategoryName('');
      await fetchCategories();
      markAsChanged();
    } catch (err) {
      setError('Ошибка при редактировании подкатегории');
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление категории
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) return;
    
    try {
      setIsLoading(true);
      await deleteCategory(categoryId);
      await fetchCategories();
      markAsChanged();
    } catch (err) {
      setError('Ошибка при удалении категории');
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление подкатегории
  const handleDeleteSubcategory = async (subcategoryId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту подкатегорию?')) return;
    
    try {
      setIsLoading(true);
      await deleteSubcategory(subcategoryId);
      await fetchCategories();
      markAsChanged();
    } catch (err) {
      setError('Ошибка при удалении подкатегории');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div>
      <div className="row g-4">
        <div className="col-md-8">
          <h3 className="mb-4">Информация профиля</h3>
          
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-md-4 text-center">
                  <div className="mb-4">
                    <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center profile-avatar">
                      👤
                    </div>
                  </div>
                  <button className="btn btn-outline-primary btn-sm profile-avatar-btn">
                    Изменить аватар
                  </button>
                </div>
                <div className="col-md-8 ps-4">
                  <div className="mb-4">
                    <label className="form-label mb-2">Имя пользователя</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Введите ваше имя"
                      disabled
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label mb-2">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="user@example.com"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHierarchyTab = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">🌳 Древовидный редактор категорий</h3>
          <p className="text-muted small mb-0">
            Управляйте структурой ваших категорий и подкатегорий
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary add-category-btn"
          onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
          disabled={isLoading}
        >
          <FaPlus className="me-2" />
          Добавить категорию
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Форма создания новой категории */}
      {showNewCategoryForm && (
        <div className="card mb-4 category-form-card">
          <div className="card-body category-form-body">
            <h5 className="category-form-title">Создание категории</h5>
            <div className="d-flex flex-column flex-md-row gap-2 align-items-stretch">
              <input
                type="text"
                className="form-control mb-2 mb-md-0 category-form-input"
                placeholder="Введите название категории..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newCategoryName.trim()) {
                    handleCreateCategory();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-success btn-sm settings-form-control"
                onClick={handleCreateCategory}
                disabled={isLoading || !newCategoryName.trim()}
              >
                <FaCheck size={12} />
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary category-cancel-btn"
                onClick={() => {
                  setShowNewCategoryForm(false);
                  setNewCategoryName('');
                }}
                disabled={isLoading}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Древовидный список категорий */}
      <div className="categories-tree">
        {categories.map((category, index) => (
          <div key={category.id} className="category-node mb-4">
            {/* Главная категория */}
            <div 
              className="card shadow-sm category-card"
              style={{
                borderLeft: `4px solid ${category.color || '#3498db'}`
              }}
            >
              <div className="card-header d-flex justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center">
                  {editingCategory === category.id ? (
                    <div className="d-flex gap-2 flex-grow-1">
                      <input
                        type="text"
                        className="form-control settings-form-control"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        disabled={isLoading}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && editCategoryName.trim()) {
                            handleEditCategory(category.id);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-success btn-sm settings-form-control"
                        onClick={() => handleEditCategory(category.id)}
                        disabled={isLoading || !editCategoryName.trim()}
                      >
                        <FaCheck size={12} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm settings-form-control"
                        onClick={() => {
                          setEditingCategory(null);
                          setEditCategoryName('');
                        }}
                        disabled={isLoading}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h5 className="mb-1">
                        {category.name}
                      </h5>
                      <small className="text-muted">
                        {category.subcategories?.length || 0} подкатегорий
                      </small>
                    </div>
                  )}
                </div>
                
                {!editingCategory && (
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        setEditingCategory(category.id);
                        setEditCategoryName(category.name);
                      }}
                      disabled={isLoading}
                      title="Редактировать категорию"
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={isLoading}
                      title="Удалить категорию"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Секция подкатегорий */}
              <div className="card-body pt-0">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <span className="me-2 text-muted">└──</span>
                    <h6 className="mb-0 text-muted">Подкатегории</h6>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm add-subcategory-btn"
                    onClick={() => setShowNewSubcategoryForm(category.id)}
                    disabled={isLoading}
                  >
                    <FaPlus className="me-2" size={12} />
                    Добавить подкатегорию
                  </button>
                </div>

                {/* Форма создания подкатегории */}
                {showNewSubcategoryForm === category.id && (
                  <div className="mb-3 p-3 rounded subcategory-form">
                    <div className="d-flex align-items-center mb-2">
                      <span className="me-2">├─ ➕</span>
                      <small className="text-muted">Новая подкатегория</small>
                    </div>
                    <div className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control form-control-sm settings-form-control"
                        placeholder="Название подкатегории..."
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        disabled={isLoading}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newSubcategoryName.trim()) {
                            handleCreateSubcategory(category.id);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-success btn-sm settings-form-control"
                        onClick={() => handleCreateSubcategory(category.id)}
                        disabled={isLoading || !newSubcategoryName.trim()}
                      >
                        <FaCheck size={12} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm settings-form-control"
                        onClick={() => {
                          setShowNewSubcategoryForm(null);
                          setNewSubcategoryName('');
                        }}
                        disabled={isLoading}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Список подкатегорий */}
                {category.subcategories && category.subcategories.length > 0 ? (
                  <div className="subcategories-tree ps-3">
                    {category.subcategories.map((subcategory, subIndex) => (
                      <div 
                        key={subcategory.id} 
                        className="subcategory-item d-flex justify-content-between align-items-center p-3 mb-2"
                        style={{
                          borderLeft: `3px solid ${category.color || '#3498db'}`
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <span className="me-2 text-muted">
                            {subIndex === category.subcategories.length - 1 ? '└─' : '├─'}
                          </span>
                          {/* Иконка файла удалена по просьбе пользователя */}
                          {editingSubcategory === subcategory.id ? (
                            <div className="d-flex gap-2 flex-grow-1">
                              <input
                                type="text"
                                className="form-control form-control-sm settings-form-control"
                                value={editSubcategoryName}
                                onChange={(e) => setEditSubcategoryName(e.target.value)}
                                disabled={isLoading}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && editSubcategoryName.trim()) {
                                    handleEditSubcategory(subcategory.id);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-success btn-sm settings-form-control"
                                onClick={() => handleEditSubcategory(subcategory.id)}
                                disabled={isLoading || !editSubcategoryName.trim()}
                              >
                                <FaCheck size={12} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm settings-form-control"
                                onClick={() => {
                                  setEditingSubcategory(null);
                                  setEditSubcategoryName('');
                                }}
                                disabled={isLoading}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span>
                              {subcategory.name}
                            </span>
                          )}
                        </div>
                        
                        {!editingSubcategory && (
                          <div className="btn-group action-btn-group">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => {
                                setEditingSubcategory(subcategory.id);
                                setEditSubcategoryName(subcategory.name);
                              }}
                              disabled={isLoading}
                              title="Редактировать подкатегорию"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeleteSubcategory(subcategory.id)}
                              disabled={isLoading}
                              title="Удалить подкатегорию"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    <div className="mb-2">📭</div>
                    <small>Подкатегории отсутствуют</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Сообщение когда нет категорий */}
      {categories.length === 0 && !isLoading && (
        <div className="text-center text-muted empty-state">
          <div className="mb-4">
            <FaCog size={64} className="empty-state-icon" />
          </div>
          <h5 className="mb-3">Категории отсутствуют</h5>
          <p className="mb-4">Создайте первую категорию для начала работы с иерархией.</p>
          <button 
            className="btn btn-primary empty-state-btn"
            onClick={() => setShowNewCategoryForm(true)}
          >
            <FaPlus className="me-2" />
            Создать первую категорию
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Link to="/" className="btn btn-outline-secondary">
          <FaArrowLeft className="me-2" /> Назад к навыкам
        </Link>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="mb-0">
            <FaCog className="me-2" />
            Настройки профиля
          </h2>
        </div>
        <div className="card-body">
          {/* Навигация по вкладкам */}
          <div className="mb-4">
            <div className="d-flex gap-2 tab-nav">
              <button
                className={`btn tab-button ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('profile')}
              >
                👤 Мой профиль
              </button>
              
              <button
                className={`btn tab-button ${activeTab === 'hierarchy' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('hierarchy')}
              >
                🗂️ Иерархия категорий
                {hasUnsavedChanges && activeTab === 'hierarchy' && (
                  <span className="badge bg-warning text-dark ms-2">
                    *
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Содержимое вкладок */}
          <div className="tab-content-area">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'hierarchy' && (
              <>
                {isLoading && (
                  <div className="loading-container">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Загрузка...</span>
                    </div>
                  </div>
                )}
                {renderHierarchyTab()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
