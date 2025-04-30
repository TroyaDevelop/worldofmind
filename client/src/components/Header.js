import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaSearch, FaSignOutAlt, FaUser, FaMoon, FaSun } from 'react-icons/fa';
import '../assets/styles/Header.scss';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

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
                  placeholder="Поиск навыков..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">
                  <FaSearch />
                </button>
              </form>

              <nav className="nav">
                <ul>
                  <li>
                    <button onClick={toggleTheme} className="theme-toggle">
                      {darkMode ? <FaSun /> : <FaMoon />}
                    </button>
                  </li>
                  <li>
                    <Link to="/add-skill" className="add-button">+ Добавить навык</Link>
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