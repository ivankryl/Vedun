// frontend/src/App.tsx
import React from 'react'
import { Link, Route, Routes, useLocation, useNavigate, Navigate } from 'react-router-dom'

import { HomePage } from './pages/HomePage'
import { BrokerPage } from './pages/BrokerPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RequireAuth } from './auth/RequireAuth'
import { InsuredPage } from './pages/InsuredPage'
import PublicSurveyPage from './pages/PublicSurveyPage' // default import
import { PublicSurveyResultsPage } from './pages/PublicSurveyResultsPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { InsuranceCompaniesPage } from './pages/InsuranceCompaniesPage'

import { SurveyHeader } from './components/layout/SurveyHeader'
import { SurveyHeaderProvider } from './context/SurveyHeaderContext'
import { AuthProvider, useAuth } from './context/AuthContext'

import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <SurveyHeaderProvider>
        <AppLayout />
      </SurveyHeaderProvider>
    </AuthProvider>
  )
}

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const feVersion = __APP_VERSION__ ?? 'dev'
  const [apiVersion, setApiVersion] = React.useState<string>('...')

  React.useEffect(() => {
    fetch('https://vedun-1.onrender.com/api/version')
      .then((r) => r.json())
      .then((d) => setApiVersion(d?.version ?? 'unknown'))
      .catch(() => setApiVersion('unknown'))
  }, [])

  const { isAuthenticated, user, logout, isLoading } = useAuth()

  const isActive = (path: string) =>
    location.pathname === path ? 'nav-link active' : 'nav-link'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const isSurveyRoute = location.pathname.startsWith('/survey/')

  return (
    <div className="app-root">
      {isSurveyRoute ? (
        <SurveyHeader />
      ) : (
        <header className="app-header">
          <div className="logo-block">
            <div className="logo-mark">B</div>
            <div className="logo-text">
              <div className="logo-title">Ведун</div>
              <span className="app-version">
                vf {feVersion} vb {apiVersion}
              </span>
              <div className="logo-subtitle">Платформа оценки киберрисков</div>
            </div>
          </div>

          <nav className="app-nav">
            <div className="nav-left">
              <Link to="/" className={isActive('/')}>Главная</Link>
              <Link to="/broker" className={isActive('/broker')}>Профиль компании</Link>
              <Link to="/insurance-companies" className={isActive('/insurance-companies')}>Страховые</Link>
            </div>

            <div className="nav-right">
              {isLoading ? null : isAuthenticated ? (
                <div className="user-menu">
                  <span className="user-name">{user?.fullName ?? 'Пользователь'}</span>
                  <span className="user-role">{user?.role ?? ''}</span>
                  <button onClick={handleLogout} className="nav-link nav-cta">Выйти</button>
                </div>
              ) : (
                <Link to="/login" className="nav-link nav-cta">Вход</Link>
              )}
            </div>
          </nav>
        </header>
      )}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/insurance-companies" element={<InsuranceCompaniesPage />} />

          {/* Публичные маршруты по token */}
          <Route path="/survey/:token" element={<PublicSurveyPage />} />
          <Route path="/survey/:token/results" element={<PublicSurveyResultsPage />} />

          {/* Если вдруг пришли по старому /s/:uuid — аккуратно редиректим в /survey/:token */}
          <Route path="/s/:token" element={<Navigate to="/survey/:token" replace />} />
          <Route path="/s/:token/results" element={<Navigate to="/survey/:token/results" replace />} />

          {/* Личные разделы — под защитой */}
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
  )
}
