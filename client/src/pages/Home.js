import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllSkills, getCategories } from '../services/skillService';
import { FaPlus, FaSearch, FaBrain, FaList, FaFilter } from 'react-icons/fa';
import NeuronSkillsMap from '../components/NeuronSkillsMap';

const Home = () => {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('neuron'); // 'neuron' или 'list'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Загрузка навыков и категорий при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsData, categoriesData] = await Promise.all([
          getAllSkills(),
          getCategories()
        ]);
        setSkills(skillsData || []);
        setCategories(categoriesData || []);
      } catch (err) {
        setError(err.message || 'Не удалось загрузить данные');
        console.error('Ошибка при загрузке данных:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Функция для отображения навыков выбранной категории или всех навыков
  const getFilteredSkills = () => {
    if (activeCategory === 'all') {
      return skills;
    }
    
    return skills.filter(skill => skill.category === activeCategory);
  };

  // Группирование навыков по категориям для отображения
  const groupSkillsByCategory = () => {
    const groupedSkills = {};
    
    getFilteredSkills().forEach(skill => {
      if (!groupedSkills[skill.category]) {
        groupedSkills[skill.category] = [];
      }
      
      groupedSkills[skill.category].push(skill);
    });
    
    return groupedSkills;
  };

  // Функция для отображения текущей выбранной категории
  const getActiveCategoryText = () => {
    return activeCategory === 'all' ? 'Все категории' : activeCategory;
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
  const filteredCategories = Object.keys(groupedSkills).sort();

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Мои навыки</h1>
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
              {categories.map((category) => (
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
      {skills.length === 0 && (
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

      {/* Нейронная визуализация навыков */}
      {skills.length > 0 && viewMode === 'neuron' && (
        <NeuronSkillsMap skills={skills} activeCategory={activeCategory} />
      )}

      {/* Отображение навыков по категориям в формате списка */}
      {skills.length > 0 && viewMode === 'list' && filteredCategories.length > 0 && (
        <div className="skills-container">
          {filteredCategories.map(category => (
            <div key={category} className="category-section mb-4">
              <h2 className="category-title">{category}</h2>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {groupedSkills[category].map(skill => (
                  <div key={skill.id} className="col">
                    <Link to={`/skills/${skill.id}`} className="text-decoration-none">
                      <div className="card h-100" style={{ borderLeft: `4px solid ${skill.color || '#3498db'}` }}>
                        <div className="card-body">
                          <h5 className="card-title">{skill.article}</h5>
                          <p className="card-text text-muted">{skill.description || 'Без описания'}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Если навыки есть, но не соответствуют выбранной категории */}
      {skills.length > 0 && filteredCategories.length === 0 && (
        <div className="alert alert-info">
          В выбранной категории навыков не найдено.
        </div>
      )}
    </div>
  );
};

export default Home;