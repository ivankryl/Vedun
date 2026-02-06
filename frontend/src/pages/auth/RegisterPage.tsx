//
//  frontend/src/pages/auth/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MainLayout } from '../../components/layout/MainLayout';
import './AuthPages.css';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    role: 'BROKER' as const,
    companyName: '',
    phone: '',
  });

  const [localError, setLocalError] = useState<string | null>(null);

  // Если уже аутентифицирован - перенаправить
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/broker', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.email || !formData.password || !formData.name) {
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
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role as any,
        companyName: formData.companyName || undefined,
        phone: formData.phone || undefined,
      });
      navigate('/broker', { replace: true });
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Не удалось зарегистрироваться');
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

            {(error || localError) && (
              <div className="auth-error">
                {error || localError}
              </div>
            )}

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
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">ФИО *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Иван Иванов"
                disabled={isLoading}
                className="form-control"
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
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block"
            >
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
          <p>
            Зарегистрируйтесь, чтобы пройти оценку и улучшить киберустойчивость организации.
          </p>
          <ul>
            <li>✅ Быстрая регистрация</li>
            <li>✅ Защищённый аккаунт</li>
            <li>✅ Доступ по ролям</li>
            <li>✅ Можно начать сразу</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};
