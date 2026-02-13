// frontend/src/pages/auth/RegisterPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MainLayout } from '../../components/layout/MainLayout';
import './AuthPages.css';

type Role = 'BROKER' | 'INSURER' | 'ANALYST'| 'CLIENT';

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

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const nextPath = useNextPath('/broker');

  const { register, isLoading, error, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    fullName: '',
    role: 'BROKER' as Role,
    companyName: '',
    phone: '',
  });

  const [localError, setLocalError] = useState<string | null>(null);

  // Если уже аутентифицирован - перенаправить
  useEffect(() => {
    if (isAuthenticated) {
      navigate(nextPath, { replace: true });
    }
  }, [isAuthenticated, navigate, nextPath]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    const email = formData.email.trim();
    const fullName = formData.fullName.trim();

    if (!email || !formData.password || !fullName) {
      setLocalError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setLocalError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Пароль должен быть не короче 6 символов');
      return;
    }

    try {
      await register({
        email,
        password: formData.password,
        fullName,
        role: formData.role,
        companyName: formData.companyName.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      });

      navigate(nextPath, { replace: true });
    } catch (err: any) {
      setLocalError(
        err?.response?.data?.message || err?.message || 'Не удалось зарегистрироваться'
      );
    }
  };

  return (
    <MainLayout showHeader={false}>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Vedun</h1>
            <h2>Регистрация</h2>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <h3>Создать аккаунт</h3>

            {(error || localError) && <div className="auth-error">{error || localError}</div>}

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="company@example.com"
                disabled={isLoading}
                className="form-control"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">ФИО *</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Иван Иванов"
                disabled={isLoading}
                className="form-control"
                autoComplete="fullName"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Роль *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
                className="form-control"
              >
                <option value="BROKER">Брокер</option>
                <option value="INSURER">Страховщик</option>
                <option value="ANALYST">Аналитик</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="companyName">Компания</label>
              <input
                id="companyName"
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Название компании"
                disabled={isLoading}
                className="form-control"
                autoComplete="organization"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Телефон</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7..."
                disabled={isLoading}
                className="form-control"
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль *</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
                className="form-control"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm">Повторите пароль *</label>
              <input
                id="passwordConfirm"
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
                className="form-control"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary btn-block">
              {isLoading ? 'Создаём аккаунт…' : 'Создать аккаунт'}
            </button>

            <div className="auth-footer">
              <p>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
              </p>
            </div>
          </form>
        </div>

        <div className="auth-side">
          <h2>Начнём работу</h2>
          <p>Зарегистрируйтесь, чтобы пройти оценку и улучшить киберустойчивость организации.</p>
          <ul>
            <li>Быстрая регистрация</li>
            <li>Защищённый аккаунт</li>
            <li>Доступ по ролям</li>
            <li>Можно начать сразу</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};
