// frontend/src/pages/PublicSurveyPage.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicSurveyByToken, getPublicSurveyUiByToken } from '../services/api'
import PublicSurveyWizardV2 from '../components/survey/PublicSurveyWizardV2'
import { useSurveyHeader } from '../context/SurveyHeaderContext'

export function PublicSurveyPage() {
  const { token } = useParams<{ token: string }>()

  const [data, setData] = useState<any>(null)
  const [uiPack, setUiPack] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const [started, setStarted] = useState(false) // <-- добавлено

  const { setState, reset } = useSurveyHeader()

  useEffect(() => {
    return () => reset()
  }, [reset])

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

        const survey = d?.survey
        const schema = survey?.schema
        const templateVersion = survey?.version ?? schema?.version ?? ui?.version ?? 'v2'

        const generatedAt =
          d?.generatedAt ??
          d?.createdAt ??
          survey?.generatedAt ??
          survey?.createdAt ??
          null

        setState((prev: any) => ({
          ...prev,
          title: 'Опрос',
          templateVersion,
          generatedAt,
          progressPercent: 0,
        }))
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Ошибка загрузки опроса')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, setState])

  const onStart = () => {
    setStarted(true)
    setState((prev: any) => ({ ...prev, progressPercent: 0 }))
  }

  const Content = () => {
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

    // Экран приветствия с кнопкой «Начать» — пока не нажали, мастер не рендерим
    if (!started) {
      return (
        <div className="page page--container">
          <div className="card">
            <div className="survey-intro">
              <h2>ЗАЯВЛЕНИЕ — ВОПРОСНИК НА СТРАХОВАНИЕ ИНФОРМАЦИОННЫХ (КИБЕР) РИСКОВ ELBRUS</h2>
              <button className="btn btn-primary" onClick={onStart}>
                Начать
              </button>
            </div>
          </div>
        </div>
      )
    }

    // После «Начать» — рендер мастера
    return (
      <div className="page page--container">
        <div className="card">
          <PublicSurveyWizardV2
            token={token}
            data={data}
            ui={uiPack.ui}
            presentation={uiPack.presentation}
            onProgressChange={(p: number) =>
              setState((prev: any) => ({ ...prev, progressPercent: p }))
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="survey-page-wrap">
      <Content />
    </div>
  )
}

export default PublicSurveyPage
