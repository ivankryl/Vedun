// frontend/src/components/survey/PublicSurveyWizardV2.tsx
import React from 'react'
import * as api from '../../services/api'

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
      answerType: 'text' | 'number' | 'radio' | 'select' | 'multi_select' | 'textarea' | string
      validation?: {
        required?: boolean
        min?: number
        max?: number
        maxLength?: number
        pattern?: string
      }
      options?: Array<{ id: string; label: string; points?: number; weight?: number }>
      placeholder?: string
      unit?: string
    }>
  }>
}

type UiQuestion = V2Schema['sections'][number]['questions'][number]

type Props = {
  token: string
  data: any // ответ getPublicSurveyByToken(token)
  ui: any // ответ из /survey/:token/ui -> ui
  presentation: any // ответ из /survey/:token/ui -> presentation
  onProgressChange?: (percent: number) => void
}

function buildSectionQuestions(schema: V2Schema, presentation: any, presentationSectionKey: string) {
  const pres = (presentation?.sections ?? []).find((s: any) => s.key === presentationSectionKey)
  if (!pres) return { title: presentationSectionKey, blocks: [], subsections: [] as any[] }

  const byKey = new Map(schema.sections.map((s) => [s.key, s]))

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

function Field({
  q,
  value,
  onChange,
}: {
  q: UiQuestion
  value: any
  onChange: (v: any) => void
}) {
  const required = !!q.validation?.required

  if (q.answerType === 'radio') {
    return (
      <div className="v2-field v2-field--radio">
        {(q.options ?? []).map((opt) => (
          <label key={opt.id} className="v2-radio">
            <input
              type="radio"
              name={q.id}
              value={opt.id}
              checked={value === opt.id}
              onChange={(e) => onChange(e.target.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
        {required ? <span className="v2-required">*</span> : null}
      </div>
    )
  }

  if (q.answerType === 'select') {
    return (
      <select className="v2-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {(q.options ?? []).map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }

  if (q.answerType === 'number') {
    return (
      <div className="v2-number">
        <input
          className="v2-input"
          type="number"
          value={value ?? ''}
          placeholder={q.placeholder ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
        {q.unit ? <span className="v2-unit">{q.unit}</span> : null}
      </div>
    )
  }

  if (q.answerType === 'textarea') {
    return (
      <textarea
        className="v2-input"
        value={value ?? ''}
        placeholder={q.placeholder ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
    )
  }

  // text (default)
  return (
    <input
      className="v2-input"
      type="text"
      value={value ?? ''}
      placeholder={q.placeholder ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export default function PublicSurveyWizardV2({
  token,
  data,
  ui,
  presentation,
  onProgressChange,
}: Props) {
  const survey = data?.survey
  const schema = survey?.schema as V2Schema

  // Восстановление индекса страницы (если есть в респондентах)
  const initialIndexFromMeta: number | undefined =
    data?.respondentMeta?.wizardPageIndex ?? undefined

  const pages = ui?.pages ?? []
  const coverIndex = pages.findIndex((p: any) => p.kind === 'cover')
  const firstWorkIndex = coverIndex >= 0 ? coverIndex + 1 : 0

  const safeInitialIndex =
    typeof initialIndexFromMeta === 'number'
      ? Math.min(Math.max(initialIndexFromMeta, 0), Math.max(pages.length - 1, 0))
      : coverIndex >= 0
      ? coverIndex // по умолчанию показываем обложку, если она есть
      : firstWorkIndex // иначе сразу идём на первый рабочий шаг

  const [pageIndex, setPageIndex] = React.useState(safeInitialIndex)
  const [answers, setAnswers] = React.useState<Record<string, any>>({})
  const [saving, setSaving] = React.useState(false)

  const page = pages[pageIndex]

  const setAnswer = (id: string, v: any) =>
    setAnswers((prev: Record<string, any>) => ({ ...prev, [id]: v }))

  const allQuestions: UiQuestion[] = React.useMemo(() => {
    const secs = schema?.sections ?? []
    return secs.flatMap((s) => s?.questions ?? [])
  }, [schema])

  const progressPercent = React.useMemo(() => {
    const total = allQuestions.length
    if (!total) return 0

    const isAnswered = (_q: UiQuestion, v: any) => {
      if (v === null || v === undefined) return false
      if (typeof v === 'string') return v.trim().length > 0
      if (Array.isArray(v)) return v.length > 0
      return true
    }

    let answered = 0
    for (const q of allQuestions) {
      if (isAnswered(q, answers[q.id])) answered += 1
    }

    return (answered / total) * 100
  }, [allQuestions, answers])

  React.useEffect(() => {
    if (onProgressChange) onProgressChange(progressPercent)
  }, [onProgressChange, progressPercent])

  const saveDraft = async () => {
    setSaving(true)
    try {
      await api.saveSurveyResponse(token, {
        answers,
        respondentMeta: { wizardPageIndex: pageIndex },
      })
      alert('Сохранено')
    } catch (e: any) {
      alert('Ошибка при сохранении: ' + (e?.response?.data?.message || e?.message))
    } finally {
      setSaving(false)
    }
  }

  const submit = async () => {
    setSaving(true)
    try {
      await api.submitSurveyResponse(token, {
        answers,
        respondentMeta: { wizardPageIndex: pageIndex },
      })
      window.location.href = `/survey/${encodeURIComponent(token)}/results`
    } catch (e: any) {
      alert('Ошибка при отправке: ' + (e?.response?.data?.message || e?.message))
    } finally {
      setSaving(false)
    }
  }

  if (!schema || schema.version !== 'v2') return <div className="card error">Это не v2-схема</div>
  if (!pages.length || !page) return <div className="card error">UI не загружен</div>

  // Обложка
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
          <button
            className="btn btn-primary"
            onClick={() => setPageIndex(firstWorkIndex)}
            type="button"
          >
            {page.primaryActionLabel ?? 'Начать'}
          </button>
        </div>
      </div>
    )
  }

  // Финал
  if (page.kind === 'result') {
    return (
      <div className="v2-doc">
        <h2>{page.title ?? 'Завершение'}</h2>
        <div className="v2-actions">
          <button className="btn btn-outline" disabled={saving} onClick={saveDraft} type="button">
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button className="btn btn-primary" disabled={saving} onClick={submit} type="button">
            {saving ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
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
                      <Field q={q} value={answers[q.id]} onChange={(v: any) => setAnswer(q.id, v)} />
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
          disabled={pageIndex <= firstWorkIndex}
          onClick={() => setPageIndex((i: number) => Math.max(firstWorkIndex, i - 1))}
          type="button"
        >
          Назад
        </button>

        <button className="btn btn-outline" disabled={saving} onClick={saveDraft} type="button">
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>

        <button
          className="btn btn-primary"
          onClick={() => setPageIndex((i: number) => Math.min(pages.length - 1, i + 1))}
          type="button"
        >
          Далее
        </button>
      </div>
    </div>
  )
}
