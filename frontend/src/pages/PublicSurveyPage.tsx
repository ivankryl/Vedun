// frontend/src/pages/PublicSurveyPage.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicSurveyByToken, getPublicSurveyUiByToken } from '../services/api'
import PublicSurveyWizardV2 from '../components/survey/PublicSurveyWizardV2'

export function PublicSurveyPage() {
  const { token } = useParams()

  const [data, setData] = useState<any>(null)
  const [uiPack, setUiPack] = useState<any>(null)

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        if (!token) throw new Error('No token')

        const [d, ui] = await Promise.all([
          getPublicSurveyByToken(token),
          getPublicSurveyUiByToken(token),
        ])

        if (cancelled) return
        setData(d)
        setUiPack(ui)
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Ошибка загрузки опроса')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token])

  if (loading) {
    return (
      <div className="page page--container">
        <div className="card">Загрузка...</div>
      </div>
    )
  }

  if (err) {
    return (
      <div className="page page--container">
        <div className="card error">Ошибка: {err}</div>
      </div>
    )
  }

  if (!data || !uiPack || !token) {
    return (
      <div className="page page--container">
        <div className="card">Не найдено</div>
      </div>
    )
  }

  const survey = data.survey
  if (survey?.version !== 'v2') {
    return (
      <div className="page page--container">
        <div className="card">Пока поддерживается только v2</div>
      </div>
    )
  }

  if (!uiPack.ui || !uiPack.presentation) {
    return (
      <div className="page page--container">
        <div className="card error">UI/presentation не получены</div>
      </div>
    )
  }

  return (
    <div className="page page--container">
      <div className="card">
        <PublicSurveyWizardV2
          token={token}
          data={data}
          ui={uiPack.ui}
          presentation={uiPack.presentation}
        />
      </div>
    </div>
  )
}
