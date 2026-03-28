// frontend/src/pages/PublicSurveyPage.tsx
import React from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../services/api'
import { useSurveyHeader } from '../context/SurveyHeaderContext'
import PublicSurveyWizardV2 from '../components/survey/PublicSurveyWizardV2'
import PublicSurveyWizardV3 from '../components/survey/PublicSurveyWizardV3'
import type { SurveyTemplate } from '../components/survey/v2/types'

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
  version: 'v2' | 'v3'
  templateTitle: string
  progress: { mode: 'pages' | 'questions' }
  header: UiHeader
  pages: UiPage[]
  data?: {
    template: any
    presentation: any
  }
}

// Локальная декларация пропсов wizard'ов
type WizardProps = {
  token: string
  data: {
    survey?: { schema?: SurveyTemplate } | any
    answers?: Record<string, any>
    respondentMeta?: { wizardPageIndex?: number; defaults?: Record<string, any>; draft?: boolean }
  }
  ui: InsurerSurveyUi
  presentation: any
  onProgressChange?: (percent: number) => void
}

const PublicSurveyWizardV2Typed = PublicSurveyWizardV2 as unknown as React.FC<WizardProps>
const PublicSurveyWizardV3Typed = PublicSurveyWizardV3 as unknown as React.FC<WizardProps>

export default function PublicSurveyPage() {
  // Читаем token из маршрута /survey/:token
  const { token = '' } = useParams<{ token: string }>()
  const { setState: setHeaderState, reset } = useSurveyHeader()

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
  const [hasProgressFromDraft, setHasProgressFromDraft] = React.useState(false)

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

        // 1) Метаданные по token
        const linkResp = await api.getPublicSurveyByToken(token)
        if (cancelled) return
        setLink(linkResp as any)

        // Автопереход на результат для завершённого опроса
        try {
          const statusRaw =
            (linkResp as any)?.survey?.status ||
            (linkResp as any)?.status ||
            (linkResp as any)?.surveyStatus
          const status = typeof statusRaw === 'string' ? statusRaw.toUpperCase() : ''
          if (status === 'SUBMITTED' || status === 'COMPLETED') {
            window.location.replace(`/survey/${encodeURIComponent(token)}/results`)
            return
          }
        } catch {
          /* no-op */
        }

        // 2) UI + presentation по token
        const uiResp = await api.getSurveyUi(token)
        if (cancelled) return
        const uiData = (uiResp as any)?.ui as InsurerSurveyUi
        const pres = (uiResp as any)?.presentation

        setUi(uiData)
        setPresentation(pres ?? uiData?.data?.presentation ?? null)

        // 3) Черновик по token
        try {
          const draftResp = await api.getPublicSurveyDraftByToken(token)
          if (!cancelled && draftResp) {
            const dStatusRaw =
              (draftResp as any)?.status || (draftResp as any)?.surveyStatus
            const dStatus = typeof dStatusRaw === 'string' ? dStatusRaw.toUpperCase() : ''
            if (dStatus === 'SUBMITTED' || dStatus === 'COMPLETED') {
              window.location.replace(`/survey/${encodeURIComponent(token)}/results`)
              return
            }

            const answers = draftResp?.answers ?? {}
            const wizardIdx = draftResp?.respondentMeta?.wizardPageIndex
            setInitialAnswers(answers)
            setInitialWizardIndex(typeof wizardIdx === 'number' ? wizardIdx : undefined)

            const pctRaw =
              draftResp?.completenessPercent ??
              draftResp?.respondentMeta?.progress ??
              0
            const pct = Number(pctRaw || 0)
            setHeaderState((prev) => ({
              ...prev,
              progressPercent: Math.round(pct),
            }))

            // Индикация прогресса для интро-кнопки
            const answersCount = Object.values(answers || {}).filter((v) => {
              if (v === null || v === undefined) return false
              if (Array.isArray(v)) return v.length > 0
              if (typeof v === 'string') return v.trim().length > 0
              return true
            }).length
            const meta = draftResp?.respondentMeta ?? {}
            const hasWizardIndex =
              typeof meta.wizardPageIndex === 'number' && meta.wizardPageIndex >= 1
            const hasDraftFlag = Boolean(meta?.draft)
            const hasProgress = hasDraftFlag || hasWizardIndex || answersCount > 0 || pct > 0
            setHasProgressFromDraft(hasProgress)
          }
        } catch (e) {
          console.debug('No draft yet for token', token)
        }

        // Заголовок/шапка
        const schemaVersion =
          (linkResp as any)?.survey?.schema?.version ||
          (linkResp as any)?.survey?.version ||
          'v2'

        setHeaderState((prev) => ({
          ...prev,
          title: uiData?.templateTitle ?? (linkResp as any)?.survey?.title ?? `Опрос · ${schemaVersion}`,
          templateVersion: schemaVersion,
          generatedAt: (linkResp as any)?.createdAt
            ? new Date((linkResp as any).createdAt).toLocaleDateString()
            : null,
          progressPercent: prev.progressPercent ?? 0,
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
  }, [token, setHeaderState, reset, startedKey])

  const onStart = React.useCallback(async () => {
    if (!token) return
    try {
      await api.openSurveyByToken(token)
      try {
        sessionStorage.setItem(startedKey, '1')
      } catch {}
      setStarted(true)
      setHeaderState((prev) => ({ ...prev, progressPercent: 0 }))
    } catch (e) {
      console.debug('openSurvey failed (non-critical)', e)
      // Даже если не открылся на сервере, позволяем двигаться дальше
      try {
        sessionStorage.setItem(startedKey, '1')
      } catch {}
      setStarted(true)
      setHeaderState((prev) => ({ ...prev, progressPercent: 0 }))
    }
  }, [setHeaderState, startedKey, token])

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

  // Если пользователь ещё не начал — показываем "интро"
  if (!started) {
    return (
      <div className="page page-container">
        <div className="card">
          <IntroHeader blocks={ui.header?.blocks ?? []} />
          <div className="survey-intro">
            <button className="btn btn-primary" onClick={onStart} type="button">
              {hasProgressFromDraft ? 'Продолжить' : 'Начать'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Определяем версию схемы
  const schemaVersion =
    (link as any)?.survey?.schema?.version ||
    (link as any)?.survey?.version ||
    ui?.version ||
    'v2'

  return (
    <div className="page page-container">
      {schemaVersion === 'v3' ? (
        <PublicSurveyWizardV3Typed
          token={token}
          data={{
            survey: (link as any).survey,
            respondentMeta: { wizardPageIndex: initialWizardIndex },
            answers: initialAnswers,
          }}
          ui={{ ...ui, version: 'v3' } as InsurerSurveyUi}
          presentation={presentation}
          onProgressChange={handleProgress}
        />
      ) : (
        <PublicSurveyWizardV2Typed
          token={token}
          data={{
            survey: (link as any).survey,
            respondentMeta: { wizardPageIndex: initialWizardIndex },
            answers: initialAnswers,
          }}
          ui={{ ...ui, version: 'v2' } as InsurerSurveyUi}
          presentation={presentation}
          onProgressChange={handleProgress}
        />
      )}
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
