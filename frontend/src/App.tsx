// frontend/src/App.tsx
import React from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { BrokerPage } from './pages/BrokerPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RequireAuth } from './auth/RequireAuth';
import { InsuredPage } from './pages/InsuredPage';
import { PublicSurveyPage } from './pages/PublicSurveyPage';
import { PublicSurveyResultsPage } from './pages/PublicSurveyResultsPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const v = import.meta.env.VITE_APP_VERSION ?? 'dev';

  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo-block">
          <div className="logo-mark">B</div>
          <div className="logo-text">
            <div className="logo-title">Ведун</div>
            <span className="app-version">v{v}</span>
            <div className="logo-subtitle">Платформа оценки киберрисков</div>
          </div>
        </div>

        <nav className="app-nav">
          <div className="nav-left">
            <Link to="/" className={isActive('/')}>
              Главная
            </Link>
            <Link to="/broker" className={isActive('/broker')}>
              Профиль компании
            </Link>
          </div>

          <div className="nav-right">
            {isLoading ? null : isAuthenticated ? (
              <div className="user-menu">
                <span className="user-name">{user?.name ?? 'Пользователь'}</span>
                <span className="user-role">{user?.role ?? ''}</span>
                <button onClick={handleLogout} className="nav-link nav-cta">
                  Выйти
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-link nav-cta">
                Вход
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/s/:token" element={<PublicSurveyPage />} />
          <Route path="/s/:token/results" element={<PublicSurveyResultsPage />} />

          <Route
            path="/broker"
            element={
              <RequireAuth>
                <BrokerPage />
              </RequireAuth>
            }
          />

          <Route
            path="/insured/:id"
            element={
              <RequireAuth>
                <InsuredPage />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
