import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import { FaSearch, FaSignOutAlt, FaUser, FaMoon, FaSun } from 'react-icons/fa';
import '../assets/styles/Header.scss';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { updateSearch, clearSearch } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Функция для выполнения поиска с debounce
  const debouncedSearch = useCallback((searchText) => {
    // Очищаем предыдущий таймер
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Если поиск пустой, очищаем поиск в контексте
    if (!searchText.trim()) {
      setIsSearching(false);
      clearSearch();
      return;
    }

    // Устанавливаем новый таймер
    const newTimer = setTimeout(() => {
      setIsSearching(false);
      
      // Всегда обновляем поиск в контексте и переходим на главную
      updateSearch(searchText);
      if (location.pathname !== '/') {
        navigate('/');
      }
    }, 300); // 300ms задержка

    setDebounceTimer(newTimer);
  }, [debounceTimer, navigate, location.pathname, updateSearch, clearSearch]);

  // Обработчик изменения поля ввода
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      setIsSearching(true);
      debouncedSearch(value);
    } else {
      setIsSearching(false);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    }
  };

  // Обработчик отправки формы (для Enter)
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Очищаем таймер и сразу выполняем поиск
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      setIsSearching(false);
      
      // Всегда обновляем поиск в контексте и переходим на главную
      updateSearch(searchQuery);
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  };

  // Очистка поиска при смене страницы
  useEffect(() => {
    if (location.pathname !== '/') {
      clearSearch();
      setSearchQuery('');
    }
  }, [location.pathname, clearSearch]);

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">WorldOfMind</Link>

          {isAuthenticated ? (
            <>
              <form className="search-form" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Начните вводить для поиска..."
                  value={searchQuery}
                  onChange={handleInputChange}
                />
                <button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Поиск...</span>
                    </div>
                  ) : (
                    <FaSearch />
                  )}
                </button>
              </form>

              <nav className="nav">
                <ul>
                  <li>
                    <button onClick={toggleTheme} className="theme-toggle">
                      {darkMode ? <FaSun /> : <FaMoon />}
                    </button>
                  </li>
                  <li className="user-dropdown">
                    <span className="username">
                      <FaUser /> {user?.username}
                    </span>
                    <div className="dropdown-content">
                      <button onClick={handleLogout}>
                        <FaSignOutAlt /> Выйти
                      </button>
                    </div>
                  </li>
                </ul>
              </nav>
            </>
          ) : (
            <nav className="nav">
              <ul>
                <li>
                  <button onClick={toggleTheme} className="theme-toggle">
                    {darkMode ? <FaSun /> : <FaMoon />}
                  </button>
                </li>
                <li>
                  <Link to="/login">Войти</Link>
                </li>
                <li>
                  <Link to="/register">Регистрация</Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;