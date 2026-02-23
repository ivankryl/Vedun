// frontend/src/pages/PublicSurveyPage.tsx
import React from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../services/api'
import { useSurveyHeader } from '../context/SurveyHeaderContext'
import PublicSurveyWizardV2 from '../components/survey/PublicSurveyWizardV2'

// Типы для UI-конфига (упрощённо)
type UiAsset =
  | { kind: 'staticPublicUrl'; url: string }
  | { kind: 'frontAssetKey'; key: string }

type UiBlock =
  | { type: 'titleRow'; leftText: string; rightLogo?: UiAsset }
  | { type: 'subtitle'; text: string }
  | { type: 'divider' }
  | { type: 'text'; text: string }

type UiHeader = { blocks: UiBlock[] }

type UiPage =
  | { key: 'cover'; kind: 'cover'; title: string; blocks: UiBlock[]; primaryActionLabel?: string }
  | {
      key: string
      kind: 'section'
      presentationSectionKey: string
      titleOverride?: string
      blocksTop?: UiBlock[]
      blocksBottom?: UiBlock[]
    }
  | { key: 'result'; kind: 'result'; title: string; blocksTop?: UiBlock[] }

type InsurerSurveyUi = {
  version: 'v2'
  templateTitle: string
  progress: { mode: 'pages' | 'questions' }
  header: UiHeader
  pages: UiPage[]
  data?: {
    template: any
    presentation: any
  }
}

export default function PublicSurveyPage() {
  const { token = '' } = useParams<{ token: string }>()
  //const { state: headerState, setState: setHeaderState, reset } = useSurveyHeader() так было
    const { setState: setHeaderState, reset } = useSurveyHeader() //так стало
    
  const startedKey = `survey_started_${token}`
  const [started, setStarted] = React.useState<boolean>(() => {
    try {
      return sessionStorage.getItem(startedKey) === '1'
    } catch {
      return false
    }
  })

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [link, setLink] = React.useState<any | null>(null)
  const [ui, setUi] = React.useState<InsurerSurveyUi | null>(null)
  const [presentation, setPresentation] = React.useState<any | null>(null)
  const [initialAnswers, setInitialAnswers] = React.useState<Record<string, any>>({})
  const [initialWizardIndex, setInitialWizardIndex] = React.useState<number | undefined>(undefined)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      if (!token) {
        setError('Не указан token')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Получаем общий link (с currentResponse, если есть)
        const linkResp = await api.getSurveyLink(token)
        if (cancelled) return
        setLink(linkResp as any)

        // Получаем UI + presentation
        const uiResp = await api.getSurveyUi(token)
        if (cancelled) return
        const uiData = (uiResp as any)?.ui as InsurerSurveyUi
        const pres = (uiResp as any)?.presentation

        setUi(uiData)
        setPresentation(pres ?? uiData?.data?.presentation ?? null)

        // Восстановим ответы и индекс страницы, если есть черновик
        const current = (linkResp as any)?.currentResponse
        const answers = current?.answers ?? {}
        const wizardIdx = current?.respondentMeta?.wizardPageIndex
        setInitialAnswers(answers)
        setInitialWizardIndex(typeof wizardIdx === 'number' ? wizardIdx : undefined)

        // Заголовок
        setHeaderState((prev) => ({
          ...prev,
          title: uiData?.templateTitle ?? linkResp?.survey?.title ?? 'Опрос · v2',
          templateVersion: linkResp?.survey?.version ?? 'v2',
          generatedAt: linkResp?.createdAt ? new Date(linkResp.createdAt).toLocaleDateString() : null,
          progressPercent: 0,
        }))
      } catch (e: any) {
        if (cancelled) return
        setError(e?.response?.data?.message || e?.message || 'Ошибка загрузки анкеты')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
      reset()
    }
  }, [token, setHeaderState, reset])

  const onStart = React.useCallback(() => {
    setStarted(true)
    try {
      sessionStorage.setItem(startedKey, '1')
    } catch {}
    setHeaderState((prev) => ({ ...prev, progressPercent: 0 }))
  }, [setHeaderState, startedKey])

  const handleProgress = React.useCallback(
    (percent: number) => {
      setHeaderState((prev) => ({ ...prev, progressPercent: Math.round(percent) }))
    },
    [setHeaderState]
  )

  if (loading) {
    return (
      <div className="page page-container">
        <div className="card">
          <div className="survey-intro">Загрузка анкеты...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page page-container">
        <div className="card">
          <div className="survey-error">{error}</div>
        </div>
      </div>
    )
  }

  if (!link || !ui || !presentation) {
    return (
      <div className="page page-container">
        <div className="card">
          <div className="survey-error">Анкета не найдена или UI не загружен</div>
        </div>
      </div>
    )
  }

  // Если пользователь ещё не начал — показываем "интро" из ui.header.blocks
  if (!started) {
    return (
      <div className="page page-container">
        <div className="card">
          <IntroHeader blocks={ui.header?.blocks ?? []} />
          <div className="survey-intro">
            <button className="btn btn-primary" onClick={onStart} type="button">
              Начать
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Рендерим wizard v2
  return (
    <div className="page page-container">
      <PublicSurveyWizardV2
        token={token}
        data={{
          survey: link.survey,
          respondentMeta: { wizardPageIndex: initialWizardIndex },
          answers: initialAnswers,
        }}
        ui={ui}
        presentation={presentation}
        onProgressChange={handleProgress}
      />
    </div>
  )
}

function IntroHeader({ blocks }: { blocks: UiBlock[] }) {
  return (
    <div className="survey-intro">
      {blocks.map((b, i) => {
        if (b.type === 'titleRow') {
          return (
            <div key={i} className="intro-title-row">
              <div className="intro-left">{b.leftText}</div>
              <div className="intro-right">
                {b.rightLogo?.kind === 'frontAssetKey' ? (
                  <span className="intro-logo">{b.rightLogo.key.toUpperCase()}</span>
                ) : b.rightLogo?.kind === 'staticPublicUrl' ? (
                  <img src={b.rightLogo.url} alt="logo" className="intro-logo-img" />
                ) : null}
              </div>
            </div>
          )
        }
        if (b.type === 'subtitle') {
          return (
            <div key={i} className="intro-subtitle">
              {b.text}
            </div>
          )
        }
        if (b.type === 'divider') {
          return <hr key={i} className="intro-divider" />
        }
        if (b.type === 'text') {
          return (
            <p key={i} className="intro-text">
              {b.text}
            </p>
          )
        }
        return null
      })}
    </div>
  )
}
