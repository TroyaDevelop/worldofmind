import React, { createContext, useState, useEffect, useContext } from 'react';

// Создаем контекст для темы
const ThemeContext = createContext();

// Кастомный хук для использования контекста темы
export const useTheme = () => useContext(ThemeContext);

// Провайдер темы
export const ThemeProvider = ({ children }) => {
  // Проверяем, есть ли сохраненная тема в localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Если тема сохранена в localStorage, используем её
    // Иначе проверяем системные настройки
    if (savedTheme) {
      return savedTheme === 'dark';
    } else {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  // Функция для переключения темы
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Сохраняем тему в localStorage при её изменении
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    // Добавляем/удаляем класс на body для переключения темы на уровне CSS
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Подписываемся на изменения системных настроек темы
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Обновляем тему только если пользователь не установил её вручную
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches);
      }
    };

    // Добавляем слушатель изменений
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Для поддержки старых браузеров
      mediaQuery.addListener(handleChange);
    }

    // Очищаем слушатель при размонтировании
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;