// frontend/src/components/layout/MainLayout.tsx
import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  showHeader = true,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="main-layout">
      {showHeader && (
        <header className="main-header">
          <div className="header-content">
            <div className="logo">
              <Link to="/" className="logo-link">
                <h1>🛡️ Vedun</h1>
              </Link>
              <p>Cyber Risk Assessment Platform</p>
            </div>

            <nav className="main-nav">
              <Link to="/">Главная</Link>

              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">Дашборд</Link>

                  <div className="user-menu">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-role">{user?.role}</span>
                    <button onClick={handleLogout} className="btn-logout">
                      Выйти
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login">Вход</Link>
                  <Link to="/register">Регистрация</Link>
                </>
              )}
            </nav>
          </div>
        </header>
      )}

      <main className="main-content">
        {title && <h1 className="page-title">{title}</h1>}
        {children}
      </main>

      <footer className="main-footer">
        <p>&copy; 2024 Vedun. Cyber Risk Assessment Platform</p>
      </footer>
    </div>
  );
};
