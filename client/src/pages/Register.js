import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth(); // Используем функцию register из контекста авторизации

  // Настройка валидации формы с помощью formik и yup
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, 'Имя пользователя должно содержать не менее 3 символов')
        .required('Необходимо указать имя пользователя'),
      password: Yup.string()
        .min(6, 'Пароль должен содержать не менее 6 символов')
        .required('Необходимо указать пароль'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
        .required('Необходимо подтвердить пароль')
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError('');
        
        // Используем функцию register из контекста
        await register({
          username: values.username,
          password: values.password
        });
        
        // Перенаправляем на главную страницу
        navigate('/');
      } catch (err) {
        setError(err.message || 'Не удалось зарегистрироваться');
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Регистрация в WorldOfMind</h2>
        
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Повторите пароль"
              className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="invalid-feedback">{formik.errors.confirmPassword}</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Выполняется регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;