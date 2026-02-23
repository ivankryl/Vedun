// frontend/src/components/survey/PublicSurveyWizardV2.tsx
import React from 'react'
import * as api from '../../services/api'
import './survey-v2.css'
import QuestionRenderer from './QuestionRenderer'

// v2 schema (как у вас)
type V2Schema = {
  version: 'v2'
  title: string
  sections: Array<{
    key: string
    title: string
    description?: string
    order: number
    questions: Array<{
      id: string
      sectionKey: string
      categoryKey?: string
      text: string
      helpText?: string
      answerType:
        | 'boolean'
        | 'radio'
        | 'select'
        | 'multi_select'
        | 'text'
        | 'number'
        | 'date'
        | 'table'
        | 'textarea'
        | string
      validation?: {
        required?: boolean
        min?: number
        max?: number
        minLength?: number
        maxLength?: number
        pattern?: string
      }
      options?: Array<{ id: string; label: string; points?: number; weight?: number }>
      placeholder?: string
      unit?: string
      fields?: Array<{
        id: string
        label: string
        type:
          | 'boolean'
          | 'radio'
          | 'select'
          | 'multi_select'
          | 'text'
          | 'number'
          | 'date'
        validation?: {
          required?: boolean
          min?: number
          max?: number
          minLength?: number
          maxLength?: number
          pattern?: string
        }
        placeholder?: string
        unit?: string
        options?: Array<{ id: string; label: string; points?: number; weight?: number }>
        scoringMode?: 'sum' | 'max'
      }>
      ui?: { minRows?: number; maxRows?: number; addRowLabel?: string }
    }>
  }>
}

type UiQuestion = V2Schema['sections'][number]['questions'][number]

type Props = {
  token: string
  data: any // getPublicSurveyByToken(token)
  ui: any // /survey/:token/ui -> ui
  presentation: any // /survey/:token/ui -> presentation
  onProgressChange?: (percent: number) => void
}

// Собираем вопросы секции для текущей страницы
function buildSectionQuestions(schema: V2Schema, presentation: any, presentationSectionKey: string) {
  const pres = (presentation?.sections ?? []).find((s: any) => s.key === presentationSectionKey)
  if (!pres) return { title: presentationSectionKey, blocks: [], subsections: [] as any[] }

  const byKey = new Map((schema.sections ?? []).map((s) => [s.key, s]))

  const collect = (sectionKeys: string[]) => {
    const out: UiQuestion[] = []
    for (const k of sectionKeys) {
      const sec = byKey.get(k)
      if (!sec) continue
      out.push(...(sec.questions ?? []))
    }
    return out
  }

  const groupByCategory = (questions: UiQuestion[], grouping: any) => {
    if (!grouping) return [{ key: 'all', title: '', questions }]

    if (grouping.type === 'byCategoryKey') {
      const remaining = new Map(questions.map((q) => [q.id, q]))
      const groups = (grouping.groups ?? []).map((g: any) => {
        const qs = questions.filter((q) => (g.categoryKeys ?? []).includes(q.categoryKey))
        qs.forEach((q) => remaining.delete(q.id))
        return { key: g.key, title: g.title, questions: qs }
      })
      const rest = Array.from(remaining.values())
      if (rest.length) groups.push({ key: 'other', title: 'Прочее', questions: rest })
      return groups
    }

    if (grouping.type === 'byQuestionId') {
      const byId = new Map(questions.map((q) => [q.id, q]))
      const used = new Set<string>()
      const groups = (grouping.groups ?? []).map((g: any) => {
        const qs = ((g.questionIds as string[] | undefined) ?? [])
          .map((id) => byId.get(id))
          .filter(Boolean) as UiQuestion[]
        qs.forEach((q) => used.add(q.id))
        return { key: g.key, title: g.title, questions: qs }
      })
      const rest = questions.filter((q) => !used.has(q.id))
      if (rest.length) groups.push({ key: 'other', title: 'Прочее', questions: rest })
      return groups
    }

    return [{ key: 'all', title: '', questions }]
  }

  const subsectionsRaw = pres.subsections?.length
    ? pres.subsections
    : [
        {
          key: pres.key + '.default',
          title: '',
          sectionKeys: pres.sectionKeys ?? [],
          blocks: pres.blocks,
        },
      ]

  const subsections = subsectionsRaw.map((sub: any) => {
    const questions = collect(sub.sectionKeys ?? [])
    const groups = groupByCategory(questions, sub.questionGrouping)
    return { key: sub.key, title: sub.title, blocks: sub.blocks ?? [], groups }
  })

  return { title: pres.title, blocks: pres.blocks ?? [], subsections }
}

// Приведение типов значений по answerType
function castAnswer(answerType: UiQuestion['answerType'], raw: any) {
  if (answerType === 'number') return raw === '' ? null : Number(raw)
  if (answerType === 'boolean') return !!raw
  if (answerType === 'multi_select') return Array.isArray(raw) ? raw : raw ? [raw] : []
  if (answerType === 'date') return raw || null
  if (answerType === 'table') return Array.isArray(raw) ? raw : []
  // radio/select/text/textarea — строки
  return raw ?? ''
}

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
    // пропускаем cover назад
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
      // Если у вас есть отдельный эндпоинт для черновика — используйте его:
      if (typeof (api as any).saveSurveyDraft === 'function') {
        await (api as any).saveSurveyDraft(token, {
          answers,
          respondentMeta: { wizardPageIndex: pageIndex, draft: true },
        })
      } else {
        // Временный вариант: ничего не отправляем, чтобы сервер не завершил опрос.
        // Оставьте здесь no-op, или замените на ваш безопасный метод сохранения.
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

  // Обложка — сюда попадать не должно (PublicSurveyPage показывает Intro), но на всякий случай:
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

  // Финальная страница — "final.1" (если у result есть такой key), иначе просто result
  if (page.kind === 'result') {
    const isFinalKey = page.key === 'final.1'
    return (
      <div className="v2-doc">
        <div className="v2-doc__header">
          <div>
            <div className="v2-h1">Кибер‑опросник (v2) · v2</div>
            <div className="v2-subtle">Сформирован: {new Date().toLocaleDateString()}</div>
          </div>
          <div className="v2-progress">Прогресс</div>
        </div>

        <h2 className="v2-section-title">{page.title ?? 'Результат'}</h2>
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
          {isFinalKey ? (
            <button className="btn btn-primary" disabled={saving} onClick={submit} type="button">
              {saving ? 'Отправка...' : 'Отправить'}
            </button>
          ) : null}
        </div>

        {error ? <div className="v2-error">{error}</div> : null}
      </div>
    )
  }

  // Страницы секций
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
                        // Внутренний тип UiQuestion передаём как есть.
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
