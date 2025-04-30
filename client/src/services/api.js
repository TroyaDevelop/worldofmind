import axios from 'axios';

const API_URL = '/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
});

// Добавляем перехватчик запросов для установки токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Добавляем перехватчик ответов для обработки истечения срока действия токена
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если сервер вернул ошибку 401 (неавторизован)
    if (error.response && error.response.status === 401) {
      // Удаляем токен авторизации и перенаправляем на страницу входа
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Если мы уже не на странице входа или регистрации, перенаправляем
      if (!/\/login|\/register/.test(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;