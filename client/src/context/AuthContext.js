import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  isTokenValid, 
  getCurrentUser, 
  fetchCurrentUser, 
  login as loginService, 
  register as registerService, 
  logout as logoutService 
} from '../services/authService';

// Создание контекста
const AuthContext = createContext();

// Хук для использования контекста аутентификации
export const useAuth = () => useContext(AuthContext);

// Провайдер контекста аутентификации
export const AuthProvider = ({ children }) => {
  // Состояние пользователя
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Проверяем валидность токена
        if (isTokenValid()) {
          const userData = getCurrentUser();
          
          if (userData) {
            // Устанавливаем данные пользователя из localStorage
            setUser(userData);
            setIsAuthenticated(true);
            
            try {
              // Обновляем данные пользователя с сервера
              const freshUserData = await fetchCurrentUser();
              setUser(freshUserData);
            } catch (error) {
              console.error('Не удалось обновить данные пользователя:', error);
              // Если обновление не удалось, но токен валиден, оставляем данные из localStorage
            }
          } else {
            // Если данных пользователя нет, сбрасываем состояние
            setUser(null);
            setIsAuthenticated(false);
            logoutService();
          }
        } else {
          // Если токен недействителен, сбрасываем состояние
          setUser(null);
          setIsAuthenticated(false);
          logoutService();
        }
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Функция для входа пользователя
  const login = async (userData) => {
    try {
      const response = await loginService(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Функция для регистрации пользователя
  const register = async (userData) => {
    try {
      const response = await registerService(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Функция для выхода пользователя
  const logout = () => {
    logoutService();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Предоставляем значение контекста
  const contextValue = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;