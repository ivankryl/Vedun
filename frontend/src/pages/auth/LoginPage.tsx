// frontend/src/pages/auth/LoginPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MainLayout } from '../../components/layout/MainLayout';
import './AuthPages.css';

function useNextPath(defaultPath = '/broker') {
  const location = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    const next = params.get('next');
    if (!next) return defaultPath;

    // защита от редиректа на внешний сайт
    if (!next.startsWith('/')) return defaultPath;

    return next;
  }, [location.search, defaultPath]);
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const nextPath = useNextPath('/broker');

  const { login, isLoading, error, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Если уже аутентифицирован - перенаправить
  useEffect(() => {
    if (isAuthenticated) {
      navigate(nextPath, { replace: true });
    }
  }, [isAuthenticated, navigate, nextPath]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setLocalError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      await login({ email: cleanEmail, password });
      navigate(nextPath, { replace: true });
    } catch (err: any) {
      setLocalError(err?.response?.data?.message || err?.message || 'Не удалось войти');
    }
  };

  return (
    <MainLayout showHeader={false}>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Vedun</h1>
            <h2>Оценка киберрисков</h2>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <h3>Вход</h3>

            {(error || localError) && (
              <div className="auth-error">{error || localError}</div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="company@example.com"
                disabled={isLoading}
                className="form-control"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="form-control"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary btn-block">
              {isLoading ? 'Входим…' : 'Войти'}
            </button>

            <div className="auth-footer">
              <p>
                Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
              </p>
            </div>
          </form>
        </div>

        <div className="auth-side">
          <h2>С возвращением!</h2>
          <p>Vedun — платформа для оценки рисков кибербезопасности вашей организации.</p>
          <ul>
            <li>Быстрая оценка</li>
            <li>Подробные отчёты</li>
            <li>Практические рекомендации</li>
            <li>Отслеживание рисков</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};
