import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllSkills, getCategories } from '../services/skillService';
import { FaPlus, FaSearch } from 'react-icons/fa';

const Home = () => {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

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

      {/* Фильтр категорий */}
      <div className="category-filter mb-4">
        <button
          className={`btn ${activeCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
          onClick={() => setActiveCategory('all')}
        >
          Все категории
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`btn ${activeCategory === category ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
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

      {/* Отображение навыков по категориям */}
      {filteredCategories.length > 0 && (
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