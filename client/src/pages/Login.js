import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Используем функцию login из контекста авторизации

  // Настройка валидации формы с помощью formik и yup
  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Необходимо указать имя пользователя'),
      password: Yup.string().required('Необходимо указать пароль')
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError('');
        
        // Используем функцию login из контекста
        await login({
          username: values.username,
          password: values.password
        });
        
        // Перенаправляем на главную страницу
        navigate('/');
      } catch (err) {
        setError(err.message || 'Не удалось выполнить вход');
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Вход в WorldOfMind</h2>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Введите имя пользователя"
              className={`form-control ${formik.touched.username && formik.errors.username ? 'is-invalid' : ''}`}
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
            />
            {formik.touched.username && formik.errors.username && (
              <div className="invalid-feedback">{formik.errors.username}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Введите пароль"
              className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="invalid-feedback">{formik.errors.password}</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Выполняется вход...' : 'Войти'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;