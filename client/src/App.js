import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ThemeProvider from './context/ThemeContext';
import { SearchProvider } from './context/SearchContext';

// Компоненты
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AddNeuron from './pages/AddNeuron';
import EditNeuron from './pages/EditNeuron';
import NeuronDetails from './pages/NeuronDetails';
import Settings from './pages/Settings';

// Стили
import './App.css';

// Защищенный маршрут - требуется авторизация
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Пока проверяем авторизацию, ничего не показываем
  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p>Проверка авторизации...</p>
        </div>
      </div>
    );
  }
  
  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Если авторизован, показываем запрошенный компонент
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <Router>
            <Header />
            <main className="app-main">
              <Routes>
                {/* Публичные маршруты */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              
              {/* Защищенные маршруты */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-neuron" 
                element={
                  <ProtectedRoute>
                    <AddNeuron />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/neurons/:id" 
                element={
                  <ProtectedRoute>
                    <NeuronDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/neurons/:id/edit" 
                element={
                  <ProtectedRoute>
                    <EditNeuron />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              {/* Обработка неизвестных маршрутов */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </Router>
      </SearchProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
