import api from './api';
import { jwtDecode } from 'jwt-decode';

// Регистрация нового пользователя
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    // Если регистрация успешна, сохраняем токен и информацию о пользователе
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Ошибка при регистрации' };
  }
};

// Вход пользователя
export const login = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    
    // Если авторизация успешна, сохраняем токен и информацию о пользователе
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Ошибка при входе' };
  }
};

// Выход пользователя
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Получение текущего пользователя
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Получение информации о текущем пользователе с сервера
export const fetchCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    
    // Обновляем информацию о пользователе в localStorage
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data.user;
  } catch (error) {
    throw error.response?.data || { error: 'Ошибка при получении данных пользователя' };
  }
};

// Изменение пароля пользователя
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Ошибка при смене пароля' };
  }
};

// Проверка действительности токена
export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Проверяем, не истек ли срок действия токена
    return decoded.exp > currentTime;
  } catch (error) {
    // При ошибке декодирования токена считаем его недействительным
    console.error('Ошибка при проверке токена:', error);
    return false;
  }
};