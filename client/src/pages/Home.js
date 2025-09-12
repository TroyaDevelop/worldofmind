import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllSkills, getCategories } from '../services/skillService';
import { getCategoriesHierarchy } from '../services/categoryService';
import { useSearch } from '../context/SearchContext';
import { FaPlus, FaSearch, FaBrain, FaList, FaFilter } from 'react-icons/fa';
import NeuronSkillsMap from '../components/NeuronSkillsMap';

const Home = () => {
  const { searchQuery, isSearchActive } = useSearch();
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('neuron'); // 'neuron' или 'list'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Загрузка навыков и категорий при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Загружаем данные...');
        const [skillsData, categoriesData, hierarchicalCategoriesData] = await Promise.all([
          getAllSkills(),
          getCategories(),
          getCategoriesHierarchy()
        ]);
        console.log('skillsData:', skillsData);
        console.log('categoriesData:', categoriesData);
        console.log('hierarchicalCategoriesData:', hierarchicalCategoriesData);
        
        setSkills(skillsData || []);
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
        const [skillsData, categoriesData, hierarchicalCategoriesData] = await Promise.all([
          getAllSkills(),
          getCategories(),
          getCategoriesHierarchy()
        ]);
        console.log('Обновленные данные - hierarchicalCategoriesData:', hierarchicalCategoriesData);
        
        setSkills(skillsData || []);
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

  // Функция для отображения навыков выбранной категории или всех навыков с учетом поиска
  const getFilteredSkills = () => {
    let filteredSkills = skills;

    // Фильтрация по категории
    if (activeCategory !== 'all') {
      if (activeCategory.startsWith('category_')) {
        // Новая иерархическая система - фильтруем по category_id
        const categoryId = parseInt(activeCategory.replace('category_', ''));
        filteredSkills = filteredSkills.filter(skill => skill.category_id === categoryId);
      } else {
        // Старая система - фильтруем по текстовому полю category
        filteredSkills = filteredSkills.filter(skill => skill.category === activeCategory);
      }
    }

    // Поиск по тексту (если активен)
    if (isSearchActive && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      filteredSkills = filteredSkills.filter(skill => {
        const matchesArticle = skill.article && skill.article.toLowerCase().includes(query);
        const matchesCategory = skill.category && skill.category.toLowerCase().includes(query);
        const matchesDescription = skill.description && skill.description.toLowerCase().includes(query);
        const matchesText = skill.text && skill.text.toLowerCase().includes(query); // Используем text вместо content
        
        return matchesArticle || matchesCategory || matchesDescription || matchesText;
      });
    }

    return filteredSkills;
  };

  // Группирование навыков по категориям для отображения
  const groupSkillsByCategory = () => {
    const groupedSkills = {};
    
    getFilteredSkills().forEach(skill => {
      // Определяем название категории для группировки
      let categoryName = skill.category; // Старая система
      
      // Если у навыка есть category_id, ищем название в hierarchicalCategories
      if (skill.category_id && hierarchicalCategories.length > 0) {
        const category = hierarchicalCategories.find(cat => cat.id === skill.category_id);
        if (category) {
          categoryName = category.name;
        }
      }
      
      // Если категория не определена, используем "Разное"
      if (!categoryName || categoryName.trim() === '') {
        categoryName = 'Разное';
      }
      
      if (!groupedSkills[categoryName]) {
        groupedSkills[categoryName] = [];
      }
      
      groupedSkills[categoryName].push(skill);
    });
    
    return groupedSkills;
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
          <p>Загружаем ваши навыки...</p>
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

  const groupedSkills = groupSkillsByCategory();

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Мои навыки</h1>
          {isSearchActive && (
            <div className="text-muted">
              <small>Поиск: "{searchQuery}" ({getFilteredSkills().length} результатов)</small>
            </div>
          )}
        </div>
        <Link to="/add-skill" className="btn btn-primary">
          <FaPlus className="me-2" /> Добавить навык
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

      {/* Если навыков нет */}
      {skills.length === 0 && !isSearchActive && (
        <div className="text-center py-5">
          <div className="mb-4">
            <FaSearch size={48} className="text-muted" />
          </div>
          <h3>У вас пока нет навыков</h3>
          <p className="text-muted">Начните добавлять свои знания и навыки прямо сейчас!</p>
          <Link to="/add-skill" className="btn btn-lg btn-primary">
            <FaPlus className="me-2" /> Добавить первый навык
          </Link>
        </div>
      )}

      {/* Если ничего не найдено по поиску */}
      {skills.length > 0 && isSearchActive && getFilteredSkills().length === 0 && (
        <div className="text-center py-5">
          <div className="mb-4">
            <FaSearch size={48} className="text-muted" />
          </div>
          <h3>Ничего не найдено</h3>
          <p className="text-muted">По запросу "{searchQuery}" ничего не найдено. Попробуйте изменить поисковый запрос.</p>
        </div>
      )}

      {/* Нейронная визуализация навыков с иерархией */}
      {skills.length > 0 && viewMode === 'neuron' && (
        <NeuronSkillsMap 
          skills={getFilteredSkills()} 
          categories={hierarchicalCategories}
          activeCategory={activeCategory} 
        />
      )}

      {/* Отображение навыков по категориям в формате списка */}
      {skills.length > 0 && viewMode === 'list' && getFilteredSkills().length > 0 && (
        <div className="skills-container">
          {Object.keys(groupedSkills).sort().map(category => (
            <div key={category} className="category-section mb-4">
              <h2 className="category-title">{category}</h2>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
                {groupedSkills[category].map(skill => {
                  const skillColor = skill.color || '#3498db';
                  const rgbColor = hexToRgb(skillColor);
                  
                  return (
                    <div key={skill.id} className="col">
                      <Link to={`/skills/${skill.id}`} className="text-decoration-none">
                        <div 
                          className="card h-100" 
                          style={{ 
                            borderLeft: `4px solid ${skillColor}`,
                            '--skill-color': skillColor,
                            '--skill-color-rgb': `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`
                          }}
                        >
                          <div className="card-body">
                            <h5 className="card-title">{skill.article}</h5>
                            <p className="card-text text-muted">{skill.description || 'Без описания'}</p>
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
      
      {/* Если навыки есть, но не соответствуют выбранной категории */}
      {skills.length > 0 && !isSearchActive && getFilteredSkills().length === 0 && activeCategory !== 'all' && (
        <div className="alert alert-info">
          В выбранной категории "{activeCategory}" навыков не найдено.
        </div>
      )}
    </div>
  );
};

export default Home;