import React, { useState, useEffect, useCallback } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);

  // При монтировании компонента и изменении параметров URL
  useEffect(() => {
    const queryParam = searchParams.get('query');
    if (queryParam) {
      setQuery(queryParam);
      setSearchQuery(queryParam);
      performSearch(queryParam);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  // Функция для выполнения поиска с debounce
  const debouncedSearch = useCallback((searchText) => {
    // Очищаем предыдущий таймер
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Если поиск пустой, очищаем результаты
    if (!searchText.trim()) {
      setResults([]);
      setQuery('');
      setLoading(false);
      setError(null);
      // Обновляем URL без параметра query
      navigate('/search', { replace: true });
      return;
    }

    // Устанавливаем новый таймер
    const newTimer = setTimeout(() => {
      setQuery(searchText);
      performSearch(searchText);
      // Обновляем URL с новым запросом
      navigate(`/search?query=${encodeURIComponent(searchText)}`, { replace: true });
    }, 300); // 300ms задержка

    setDebounceTimer(newTimer);
  }, [debounceTimer, navigate]);

  // Обработчик изменения поля ввода
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setLoading(true);
    debouncedSearch(value);
  };

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

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
          <div className="mb-4">
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Начните вводить для поиска навыков..."
                value={searchQuery}
                onChange={handleInputChange}
                aria-label="Поиск в реальном времени"
              />
            </div>
            <small className="form-text text-muted mt-2">
              Поиск происходит автоматически по мере ввода текста
            </small>
          </div>

          {query && (
            <div className="d-flex align-items-center text-muted mb-2">
              <span>Результаты поиска для: <strong>{query}</strong></span>
              {loading && (
                <div className="spinner-border spinner-border-sm ms-2" role="status">
                  <span className="visually-hidden">Поиск...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error ? (
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
          ) : query && !loading ? (
            <div className="text-center my-5">
              <div className="mb-4">
                <FaSearch size={48} className="text-muted" />
              </div>
              <h3>Ничего не найдено</h3>
              <p className="text-muted">Попробуйте изменить поисковый запрос</p>
            </div>
          ) : !query && !loading ? (
            <div className="text-center my-5">
              <div className="mb-4">
                <FaSearch size={48} className="text-muted" />
              </div>
              <h3>Введите запрос для поиска</h3>
              <p className="text-muted">Поиск работает по названию, категории, описанию и содержанию навыков</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default SearchPage;