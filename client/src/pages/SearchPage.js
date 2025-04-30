import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { searchSkills } from '../services/skillService';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';

const SearchPage = () => {
  // Получаем параметры из URL
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Состояния для хранения данных
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // При монтировании компонента и изменении параметров URL
  useEffect(() => {
    const queryParam = searchParams.get('query');
    if (queryParam) {
      setQuery(queryParam);
      performSearch(queryParam);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  // Функция для выполнения поиска
  const performSearch = async (searchText) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchResults = await searchSkills(searchText);
      setResults(searchResults || []);
    } catch (err) {
      setError(err.message || 'Не удалось выполнить поиск');
      console.error('Ошибка при поиске:', err);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик отправки формы поиска
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Link to="/" className="btn btn-outline-secondary">
          <FaArrowLeft className="me-2" /> Вернуться на главную
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h1 className="card-title h5 mb-4">Поиск навыков</h1>
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Введите запрос для поиска..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Поиск"
              />
              <button className="btn btn-primary" type="submit">
                <FaSearch className="me-2" /> Искать
              </button>
            </div>
          </form>

          {query && (
            <p className="text-muted">
              Результаты поиска для: <strong>{query}</strong>
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-2">Поиск навыков...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <p>{error}</p>
          <button 
            className="btn btn-sm btn-outline-danger" 
            onClick={() => performSearch(query)}
          >
            Попробовать еще раз
          </button>
        </div>
      ) : (
        <>
          {results.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {results.map(skill => (
                <div key={skill.id} className="col">
                  <Link to={`/skills/${skill.id}`} className="text-decoration-none">
                    <div className="card h-100" style={{ borderLeft: `4px solid ${skill.color || '#3498db'}` }}>
                      <div className="card-body">
                        <h5 className="card-title">{skill.article}</h5>
                        {skill.category && (
                          <div className="mb-2">
                            <span className="badge bg-secondary">{skill.category}</span>
                          </div>
                        )}
                        <p className="card-text text-muted">{skill.description || 'Без описания'}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="text-center my-5">
              <div className="mb-4">
                <FaSearch size={48} className="text-muted" />
              </div>
              <h3>Ничего не найдено</h3>
              <p className="text-muted">Попробуйте изменить поисковый запрос</p>
            </div>
          ) : (
            <div className="text-center my-5">
              <div className="mb-4">
                <FaSearch size={48} className="text-muted" />
              </div>
              <h3>Введите запрос для поиска</h3>
              <p className="text-muted">Поиск работает по названию, категории, описанию и содержанию навыков</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;