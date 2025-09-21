import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllNeurons, getCategories } from '../services/neuronService';
import { getCategoriesHierarchy } from '../services/categoryService';
import { useSearch } from '../context/SearchContext';
import { FaPlus, FaSearch, FaBrain, FaList, FaFilter } from 'react-icons/fa';
import NeuronMap from '../components/NeuronMap';

const Home = () => {
  const { searchQuery, isSearchActive } = useSearch();
  const [neurons, setNeurons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('neuron'); // 'neuron' или 'list'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Загрузка нейронов и категорий при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Загружаем данные...');
        const [neuronsData, categoriesData, hierarchicalCategoriesData] = await Promise.all([
          getAllNeurons(),
          getCategories(),
          getCategoriesHierarchy()
        ]);
        console.log('neuronsData:', neuronsData);
        console.log('categoriesData:', categoriesData);
        console.log('hierarchicalCategoriesData:', hierarchicalCategoriesData);
        
        setNeurons(neuronsData || []);
        setCategories(categoriesData || []);
        setHierarchicalCategories(hierarchicalCategoriesData || []);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Обновление данных при фокусе на странице (когда пользователь возвращается)
  useEffect(() => {
    const handleFocus = async () => {
      try {
        console.log('Обновляем данные при фокусе...');
        const [neuronsData, categoriesData, hierarchicalCategoriesData] = await Promise.all([
          getAllNeurons(),
          getCategories(),
          getCategoriesHierarchy()
        ]);
        console.log('Обновленные данные - hierarchicalCategoriesData:', hierarchicalCategoriesData);
        
        setNeurons(neuronsData || []);
        setCategories(categoriesData || []);
        setHierarchicalCategories(hierarchicalCategoriesData || []);
      } catch (err) {
        console.error('Ошибка при обновлении данных:', err);
      }
    };

    // Слушаем событие фокуса окна
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const closeDropdown = (e) => {
      if (isDropdownOpen && !e.target.closest('.category-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, [isDropdownOpen]);

  // Функция для отображения нейронов выбранной категории или всех нейронов с учетом поиска
  const getFilteredNeurons = () => {
    let filteredNeurons = neurons;

    // Фильтрация по категории
    if (activeCategory !== 'all') {
      if (activeCategory.startsWith('category_')) {
        // Новая иерархическая система - фильтруем по category_id
        const categoryId = parseInt(activeCategory.replace('category_', ''));
        filteredNeurons = filteredNeurons.filter(neuron => neuron.category_id === categoryId);
      } else {
        // Старая система - фильтруем по текстовому полю category
        filteredNeurons = filteredNeurons.filter(neuron => neuron.category === activeCategory);
      }
    }

    // Поиск по тексту (если активен)
    if (isSearchActive && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      filteredNeurons = filteredNeurons.filter(neuron => {
        const matchesArticle = neuron.article && neuron.article.toLowerCase().includes(query);
        const matchesCategory = neuron.category && neuron.category.toLowerCase().includes(query);
        const matchesDescription = neuron.description && neuron.description.toLowerCase().includes(query);
        const matchesText = neuron.text && neuron.text.toLowerCase().includes(query); // Используем text вместо content
        
        return matchesArticle || matchesCategory || matchesDescription || matchesText;
      });
    }

    return filteredNeurons;
  };

  // Группирование нейронов по категориям для отображения
  const groupNeuronsByCategory = () => {
    const groupedNeurons = {};
    
    getFilteredNeurons().forEach(neuron => {
      // Определяем название категории для группировки
      let categoryName = neuron.category; // Старая система
      
      // Если у нейрона есть category_id, ищем название в hierarchicalCategories
      if (neuron.category_id && hierarchicalCategories.length > 0) {
        const category = hierarchicalCategories.find(cat => cat.id === neuron.category_id);
        if (category) {
          categoryName = category.name;
        }
      }
      
      // Если категория не определена, используем "Разное"
      if (!categoryName || categoryName.trim() === '') {
        categoryName = 'Разное';
      }
      
      if (!groupedNeurons[categoryName]) {
        groupedNeurons[categoryName] = [];
      }
      
      groupedNeurons[categoryName].push(neuron);
    });
    
    return groupedNeurons;
  };

  // Функция для отображения текущей выбранной категории
  const getActiveCategoryText = () => {
    if (activeCategory === 'all') return 'Все категории';
    
    if (activeCategory.startsWith('category_')) {
      const categoryId = parseInt(activeCategory.replace('category_', ''));
      const category = hierarchicalCategories.find(cat => cat.id === categoryId);
      return category ? category.name : activeCategory;
    }
    
    return activeCategory;
  };

  // Функция для конвертации HEX цвета в RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 52, g: 152, b: 219 }; // Fallback цвет
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p>Загружаем ваши нейрони...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Произошла ошибка</h4>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const groupedNeurons = groupNeuronsByCategory();

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Мои нейроны</h1>
          {isSearchActive && (
            <div className="text-muted">
              <small>Поиск: "{searchQuery}" ({getFilteredNeurons().length} результатов)</small>
            </div>
          )}
        </div>
        <Link to="/add-neuron" className="btn btn-primary">
          <FaPlus className="me-2" /> Добавить нейрон
        </Link>
      </div>

      {/* Переключатель режимов отображения */}
      <div className="view-mode-toggle">
        <button
          className={`btn ${viewMode === 'neuron' ? 'btn-primary active' : 'btn-outline-primary'}`}
          onClick={() => setViewMode('neuron')}
        >
          <FaBrain className="me-2" /> Нейронная карта
        </button>
        <button
          className={`btn ${viewMode === 'list' ? 'btn-primary active' : 'btn-outline-primary'}`}
          onClick={() => setViewMode('list')}
        >
          <FaList className="me-2" /> Список
        </button>
      </div>

      {/* Выпадающий список категорий */}
      <div className="category-dropdown-container mb-4">
        <div className="category-dropdown">
          <button 
            className="btn btn-outline-primary dropdown-toggle d-flex align-items-center justify-content-between"
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <span>
              <FaFilter className="me-2" /> {getActiveCategoryText()}
            </span>
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu show">
              <button 
                className={`dropdown-item ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory('all');
                  setIsDropdownOpen(false);
                }}
              >
                Все категории
              </button>
              
              {/* Иерархические категории */}
              {hierarchicalCategories.filter(category => 
                category.name && category.name.trim() !== '' && category.name !== 'Разное'
              ).map((category) => {
                return (
                <button
                  key={category.id}
                  className={`dropdown-item fw-bold ${activeCategory === `category_${category.id}` ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(`category_${category.id}`);
                    setIsDropdownOpen(false);
                  }}
                >
                  {category.name}
                </button>
                );
              })}
              
              {/* Старые категории (для обратной совместимости) */}
              {categories.filter(category => 
                category && 
                category.trim() !== '' &&
                category !== 'Разное' &&
                !hierarchicalCategories.some(hcat => hcat.name === category)
              ).map((category) => (
                <button
                  key={category}
                  className={`dropdown-item ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(category);
                    setIsDropdownOpen(false);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Если нейронов нет */}
      {neurons.length === 0 && !isSearchActive && (
        <div className="text-center py-5">
          <div className="mb-4">
            <FaSearch size={48} className="text-muted" />
          </div>
          <h3>У вас пока нет нейронов</h3>
          <p className="text-muted">Начните добавлять свои знания и нейрони прямо сейчас!</p>
          <Link to="/add-neuron" className="btn btn-lg btn-primary">
            <FaPlus className="me-2" /> Добавить первый нейрон
          </Link>
        </div>
      )}

      {/* Нейронная визуализация нейронов с иерархией */}
      {neurons.length > 0 && viewMode === 'neuron' && (
        <NeuronMap 
          neurons={getFilteredNeurons()} 
          categories={hierarchicalCategories}
          activeCategory={activeCategory}
          isSearchActive={isSearchActive}
        />
      )}

      {/* Отображение нейронов по категориям в формате списка */}
      {neurons.length > 0 && viewMode === 'list' && getFilteredNeurons().length > 0 && (
        <div className="neurons-container">
          {Object.keys(groupedNeurons).sort().map(category => (
            <div key={category} className="category-section mb-4">
              <h2 className="category-title">{category}</h2>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
                {groupedNeurons[category].map(neuron => {
                  const neuronColor = neuron.color || '#3498db';
                  const rgbColor = hexToRgb(neuronColor);
                  
                  return (
                    <div key={neuron.id} className="col">
                      <Link to={`/neurons/${neuron.id}`} className="text-decoration-none">
                        <div 
                          className="card h-100" 
                          style={{ 
                            borderLeft: `4px solid ${neuronColor}`,
                            '--neuron-color': neuronColor,
                            '--neuron-color-rgb': `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`
                          }}
                        >
                          <div className="card-body">
                            <h5 className="card-title">{neuron.article}</h5>
                            <p className="card-text text-muted">{neuron.description || 'Без описания'}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Если нейрони есть, но не соответствуют выбранной категории */}
      {neurons.length > 0 && !isSearchActive && getFilteredNeurons().length === 0 && activeCategory !== 'all' && (
        <div className="alert alert-info">
          В выбранной категории "{activeCategory}" нейронов не найдено.
        </div>
      )}
    </div>
  );
};

export default Home;