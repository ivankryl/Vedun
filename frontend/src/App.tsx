// frontend/src/App.tsx
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { BrokerPage } from './pages/BrokerPage';
import { LoginPage } from './pages/LoginPage';
import { RequireAuth } from './auth/RequireAuth';
import { InsuredPage } from './pages/InsuredPage';

import './App.css';

export default function App() {
  return <AppLayout />;
}

function AppLayout() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo-block">
          <div className="logo-mark">B</div>
          <div className="logo-text">
            <div className="logo-title">Ведун</div>
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
            <Link to="/login" className="nav-link nav-cta">
              Вход
            </Link>
          </div>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

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
