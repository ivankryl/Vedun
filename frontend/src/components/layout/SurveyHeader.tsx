//  frontend/src/components/layout/SurveyHeader.tsx
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSurveyHeader } from '../../context/SurveyHeaderContext'

function formatDt(value?: string | null) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export const SurveyHeader: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout, isLoading } = useAuth()
  const { state } = useSurveyHeader()

  const canGoBack = window.history.length > 1

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const dt = formatDt(state.generatedAt)

  return (
    <header
      className="survey-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <div
        className="survey-header-inner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {canGoBack ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="nav-link"
              style={{ cursor: 'pointer' }}
            >
              ← Назад
            </button>
          ) : (
            <Link to="/" className="nav-link">
              На главную
            </Link>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, minWidth: 0 }}>
            <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {state.title ?? 'Опрос'}
              {state.templateVersion ? <span style={{ opacity: 0.7 }}> · {state.templateVersion}</span> : null}
            </strong>
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              {dt ? <>Сформирован: {dt}</> : location.pathname}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {typeof state.progressPercent === 'number' ? (
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              Прогресс: <strong>{Math.max(0, Math.min(100, Math.round(state.progressPercent)))}%</strong>
            </div>
          ) : null}

          {isLoading ? null : isAuthenticated ? (
            <>
              <span style={{ fontSize: 12, opacity: 0.8 }}>{user?.fullName ?? 'Пользователь'}</span>
              <button onClick={handleLogout} className="nav-link nav-cta">
                Выйти
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link nav-cta">
              Вход
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
