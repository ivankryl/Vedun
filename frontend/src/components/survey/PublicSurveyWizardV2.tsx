// frontend/src/components/survey/PublicSurveyWizardV2.tsx
import React from 'react'
import * as api from '../../services/api'
import './survey-v2.css'
import QuestionRenderer from './QuestionRenderer'

// ... типы без изменений ...

export default function PublicSurveyWizardV2({ token, data, ui, presentation, onProgressChange }: Props) {
  const survey = data?.survey
  const schema = survey?.schema as V2Schema

  const initialIndexFromMeta: number | undefined =
    data?.respondentMeta?.wizardPageIndex ?? undefined

  const pages = ui?.pages ?? []
  const coverIndex = pages.findIndex((p: any) => p.kind === 'cover')
  const firstWorkIndex = coverIndex >= 0 ? coverIndex + 1 : 0

  const safeInitialIndex =
    typeof initialIndexFromMeta === 'number'
      ? Math.min(Math.max(initialIndexFromMeta, 0), Math.max(pages.length - 1, 0))
      : firstWorkIndex

  const [pageIndex, setPageIndex] = React.useState(safeInitialIndex)
  const [answers, setAnswers] = React.useState<Record<string, any>>(data?.answers ?? {})
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const page = pages[pageIndex]

  const setAnswer = (id: string, raw: any, answerType?: UiQuestion['answerType']) => {
    const casted = answerType ? castAnswer(answerType, raw) : raw
    setAnswers((prev: Record<string, any>) => ({ ...prev, [id]: casted }))
  }

  const allQuestions: UiQuestion[] = React.useMemo(() => {
    const secs = schema?.sections ?? []
    return secs.flatMap((s) => s?.questions ?? [])
  }, [schema])

  // Прогресс: доля непустых ответов
  React.useEffect(() => {
    if (!onProgressChange) return
    const total = allQuestions.length
    const isFilled = (v: any) => {
      if (v === null || v === undefined) return false
      if (Array.isArray(v)) return v.length > 0
      if (typeof v === 'string') return v.trim().length > 0
      return true
    }
    const answered = allQuestions.reduce((acc, q) => acc + (isFilled(answers[q.id]) ? 1 : 0), 0)
    const percent = total > 0 ? Math.round((answered / total) * 100) : 0
    onProgressChange(percent)
  }, [answers, allQuestions, onProgressChange])

  // Переключение страницы БЕЗ сетевого вызова (никакого автокомплита)
  const changePage = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= pages.length) return
    setError(null)
    setPageIndex(nextIndex)
  }

  const onPrev = () => {
    let idx = pageIndex - 1
    if (idx >= 0 && pages[idx]?.kind === 'cover') idx -= 1
    changePage(Math.max(firstWorkIndex, idx))
  }

  const onNext = () => {
    let idx = pageIndex + 1
    changePage(Math.min(pages.length - 1, idx))
  }

  // Безопасное сохранение черновика: НЕ завершает опрос
  const saveDraftSafe = async () => {
    setSaving(true)
    setError(null)
    try {
      // Если есть отдельный эндпоинт — используйте его:
      if (typeof (api as any).saveSurveyDraft === 'function') {
        await (api as any).saveSurveyDraft(token, {
          answers,
          respondentMeta: { wizardPageIndex: pageIndex, draft: true },
        })
      } else {
        // ВРЕМЕННО: можно вообще не дергать сервер, если ваш submit воспринимается как завершение.
        // Закомментируйте следующий блок, если submitSurveyResponse завершает опрос:
        // await api.submitSurveyResponse(token, {
        //   answers,
        //   respondentMeta: { wizardPageIndex: pageIndex, draft: true },
        // })
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      await api.submitSurveyResponse(token, {
        answers,
        respondentMeta: { wizardPageIndex: pageIndex, submittedAt: new Date().toISOString() },
      })
      window.location.href = `/survey/${encodeURIComponent(token)}/results`
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Ошибка отправки')
    } finally {
      setSaving(false)
    }
  }

  if (!schema || schema.version !== 'v2') return <div className="card error">Это не v2‑схема</div>
  if (!pages.length || !page) return <div className="card error">UI не загружен</div>

  if (page.kind === 'cover') {
    return (
      <div className="v2-doc">
        <div className="v2-doc__header">
          <div>
            <div className="v2-h1">ЗАЯВЛЕНИЕ — ВОПРОСНИК</div>
            <div className="v2-h2">НА СТРАХОВАНИЕ ИНФОРМАЦИОННЫХ (КИБЕР) РИСКОВ</div>
          </div>
          <div className="v2-logo">ELBRUS</div>
        </div>
        <div className="v2-actions">
          <button className="btn btn-primary" onClick={() => changePage(firstWorkIndex)} type="button">
            {page.primaryActionLabel ?? 'Начать'}
          </button>
        </div>
      </div>
    )
  }

  const vm = buildSectionQuestions(schema, presentation, page.presentationSectionKey)

  return (
    <div className="v2-doc">
      <div className="v2-doc__header">
        <div>
          <div className="v2-h1">ЗАЯВЛЕНИЕ — ВОПРОСНИК</div>
          <div className="v2-h2">НА СТРАХОВАНИЕ ИНФОРМАЦИОННЫХ (КИБЕР) РИСКОВ</div>
        </div>
        <div className="v2-logo">ELBRUS</div>
      </div>

      <div className="v2-section-title">{vm.title}</div>

      {vm.subsections.map((sub: any) => (
        <div key={sub.key} className="v2-subsection">
          {sub.title ? <div className="v2-subtitle">{sub.title}</div> : null}

          {sub.groups.map((g: any) => (
            <div key={g.key} className="v2-group">
              {g.title ? <div className="v2-group-title">{g.title}</div> : null}

              <div className="v2-table">
                {g.questions.map((q: UiQuestion) => (
                  <div key={q.id} className="v2-row">
                    <div className="v2-cell v2-cell--q">
                      <div className="v2-qtext">{q.text}</div>
                      {q.helpText ? <div className="v2-help">{q.helpText}</div> : null}
                    </div>
                    <div className="v2-cell v2-cell--a">
                      <QuestionRenderer
                        question={q}
                        value={answers[q.id]}
                        onChange={(v: any) => setAnswer(q.id, v, q.answerType)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="v2-actions">
        <button
          className="btn btn-secondary"
          disabled={pageIndex <= firstWorkIndex || saving}
          onClick={onPrev}
          type="button"
        >
          Назад
        </button>

        <button className="btn btn-outline" disabled={saving} onClick={saveDraftSafe} type="button">
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>

        <button className="btn btn-primary" disabled={saving} onClick={onNext} type="button">
          Далее
        </button>
      </div>

      {error ? <div className="v2-error">{error}</div> : null}
    </div>
  )
}
