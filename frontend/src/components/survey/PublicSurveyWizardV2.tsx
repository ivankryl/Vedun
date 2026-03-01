// frontend/src/components/survey/PublicSurveyWizardV2.tsx
import React from 'react'
import * as api from '../../services/api'
import './survey-v2.css'
import QuestionRenderer from './QuestionRenderer'
import type { SurveyTemplate, Question, AnswerType, Section } from './v2/types'

type UiQuestion = Question
type Presentation = {
  sections?: Array<{
    key: string
    title?: string
    blocks?: any[]
    sectionKeys?: string[]
    subsections?: Array<{
      key: string
      title?: string
      blocks?: any[]
      sectionKeys?: string[]
      questionGrouping?: {
        type?: 'byCategoryKey' | 'byQuestionId'
        groups?: Array<{
          key: string
          title?: string
          categoryKeys?: string[]
          questionIds?: string[]
        }>
      }
    }>
  }>
}

type Props = {
  token: string
  data: {
    survey?: { schema?: SurveyTemplate }
    answers?: Record<string, any>
    respondentMeta?: { wizardPageIndex?: number; defaults?: Record<string, any> }
  }
  ui: any
  presentation: Presentation
  onProgressChange?: (percent: number) => void
}

// Канонизация ключей вопроса: приводим все варианты к одному виду
function canonicalId(raw: string): string {
  let s = String(raw).trim().toLowerCase()
  // Частный случай: в префиксах иногда прилетает '@' вместо '0'
  // s@1.01 -> s01.01
  s = s.replace(/s@/g, 's0')
  // Все пробелы -> '_'
  s = s.replace(/\s+/g, '_')
  // Точки/дефисы оставляем, остальное в '_'
  s = s.replace(/[^a-z0-9._-]/g, '_')
  // Схлопываем подряд идущие разделители
  s = s.replace(/__+/g, '_').replace(/\.\.+/g, '.').replace(/--+/g, '-')
  return s
}

function extractIdPrefix(id: string | undefined) {
  if (!id) return null
  const cid = canonicalId(id)
  const m = cid.match(/^s(\d{2}\.\d{2})[_.-]/)
  return m ? m[1] : null
}

function buildSectionQuestions(
  schema: SurveyTemplate | undefined,
  presentation: Presentation,
  presentationSectionKey: string
) {
  const pres = (presentation.sections ?? []).find((s) => s.key === presentationSectionKey)
  if (!pres) return { title: presentationSectionKey, blocks: [], subsections: [] as any[] }

  const byKey = new Map<string, Section>((schema?.sections ?? []).map((s: Section) => [s.key, s]))

  const collect = (sectionKeys: string[]) => {
    const out: UiQuestion[] = []
    for (const k of sectionKeys) {
      const sec = byKey.get(k)
      if (!sec) continue
      out.push(...(sec.questions ?? []))
    }
    // Удалим дубликаты по canonicalId
    const uniq = new Map(out.map((q) => [canonicalId(q.id), q]))
    return Array.from(uniq.values())
  }

  const groupByCategory = (questions: UiQuestion[], grouping: any) => {
    if (!grouping) return [{ key: 'all', title: '', questions }]

    if (grouping.type === 'byCategoryKey') {
      const remaining = new Map(questions.map((q) => [canonicalId(q.id), q]))
      const groups = (grouping.groups ?? []).map(
        (g: { key: string; title?: string; categoryKeys?: string[] }) => {
          const qs = questions.filter((q) => (g.categoryKeys ?? []).includes(q.categoryKey as string))
          qs.forEach((q) => remaining.delete(canonicalId(q.id)))
          const uniq = new Map(qs.map((q) => [canonicalId(q.id), q]))
          return { key: g.key, title: g.title, questions: Array.from(uniq.values()) }
        }
      )
      const rest = Array.from(remaining.values())
      if (rest.length) groups.push({ key: 'other', title: 'Прочее', questions: rest })
      return groups
    }

    if (grouping.type === 'byQuestionId') {
      const byId = new Map(questions.map((q) => [canonicalId(q.id), q]))
      const used = new Set<string>()
      const groups = (grouping.groups ?? []).map(
        (g: { key: string; title?: string; questionIds?: string[] }) => {
          const qs = ((g.questionIds as string[] | undefined) ?? [])
            .map((id) => byId.get(canonicalId(id)))
            .filter(Boolean) as UiQuestion[]
          qs.forEach((q) => used.add(canonicalId(q.id)))
          const uniq = new Map(qs.map((q) => [canonicalId(q.id), q]))
          return { key: g.key, title: g.title, questions: Array.from(uniq.values()) }
        }
      )
      const rest = questions.filter((q) => !used.has(canonicalId(q.id)))
      if (rest.length) groups.push({ key: 'other', title: 'Прочее', questions: rest })
      return groups
    }

    return [{ key: 'all', title: '', questions }]
  }

  const subsectionsRaw =
    pres.subsections?.length
      ? pres.subsections
      : [
          {
            key: pres.key + '.default',
            title: '',
            sectionKeys: pres.sectionKeys ?? [],
            blocks: pres.blocks,
          },
        ]

  const subsections = subsectionsRaw.map((sub: {
    key: string
    title?: string
    blocks?: any[]
    sectionKeys?: string[]
    questionGrouping?: any
  }) => {
    const questions = collect(sub.sectionKeys ?? [])
    const groups = groupByCategory(questions, sub.questionGrouping)
    return { key: sub.key, title: sub.title, blocks: sub.blocks ?? [], groups }
  })

  return { title: pres.title ?? pres.key, blocks: pres.blocks ?? [], subsections }
}

function castAnswer(answerType: AnswerType, raw: any) {
  if (answerType === 'number') return raw === '' ? null : Number(raw);
  if (answerType === 'boolean') return raw === true ? true : raw === false ? false : (raw === 'true' ? true : raw === 'false' ? false : null);
  if (answerType === 'multi_select') return Array.isArray(raw) ? raw : raw ? [raw] : [];
  if (answerType === 'radio' || answerType === 'select') return raw ?? ''; // одинарный выбор
  if (answerType === 'date') return raw || null;
  if (answerType === 'table') return Array.isArray(raw) ? raw : [];
  return raw ?? '';
}

export default function PublicSurveyWizardV2({ token, data, ui, presentation, onProgressChange }: Props) {
  const schema: SurveyTemplate | undefined = data?.survey?.schema as SurveyTemplate | undefined
  const initialIndexFromMeta: number | undefined = data?.respondentMeta?.wizardPageIndex ?? undefined

  const pagesRaw: Array<any> = ui?.pages ?? []
  const coverIndex = pagesRaw.findIndex((p: any) => p.kind === 'cover')

  const workPagesForPager: Array<{ p: any; i: number }> = pagesRaw
    .map((p: any, i: number) => ({ p, i }))
    .filter(({ p }) => p.kind !== 'cover' && p.kind !== 'result')

  const firstWorkIndexGlobal = coverIndex >= 0 ? coverIndex + 1 : 0

  const safeInitialIndex =
    typeof initialIndexFromMeta === 'number'
      ? Math.min(Math.max(initialIndexFromMeta, 0), Math.max(pagesRaw.length - 1, 0))
      : firstWorkIndexGlobal

  // Прогоняем входные ответы через canonicalId на этапе инициализации
  const normalizedInitialAnswers = React.useMemo(() => {
    const src = { ...(data?.answers ?? {}), ...(data?.respondentMeta?.defaults ?? {}) }
    const out: Record<string, any> = {}
    for (const k of Object.keys(src)) {
      out[canonicalId(k)] = src[k]
    }
    return out
  }, [data])

  const [pageIndex, setPageIndex] = React.useState(safeInitialIndex)
  const [answers, setAnswers] = React.useState<Record<string, any>>(normalizedInitialAnswers)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState(0)

  const page = pagesRaw[pageIndex]

  const setAnswer = (id: string, raw: any, answerType?: AnswerType) => {
    const key = canonicalId(id)
    const casted = answerType ? castAnswer(answerType, raw) : raw
    setAnswers((prev: Record<string, any>) => {
      if (prev[key] === casted) return prev
      return { ...prev, [key]: casted }
    })
  }

  const allQuestions: UiQuestion[] = React.useMemo(() => {
    const secs = schema?.sections ?? []
    const flat = secs.flatMap((s: Section) => s?.questions ?? [])
    // Убираем дубли по canonicalId
    const uniq = new Map(flat.map((q) => [canonicalId(q.id), q]))
    return Array.from(uniq.values())
  }, [schema])

  React.useEffect(() => {
    const total = allQuestions.length
    const isFilled = (v: any) => {
      if (v === null || v === undefined) return false
      if (Array.isArray(v)) return v.length > 0
      if (typeof v === 'string') return v.trim().length > 0
      return true
    }
    const answered = allQuestions.reduce((acc, q) => acc + (isFilled(answers[canonicalId(q.id)]) ? 1 : 0), 0)
    const percent = total > 0 ? Math.round((answered / total) * 100) : 0
    setProgress(percent)
    onProgressChange?.(percent)
  }, [answers, allQuestions, onProgressChange])

  const changePage = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= pagesRaw.length) return
    setError(null)
    setPageIndex(nextIndex)
  }

  const onPrev = () => {
    let idx = pageIndex - 1
    if (idx >= 0 && pagesRaw[idx]?.kind === 'cover') idx -= 1
    changePage(Math.max(0, idx))
  }

  const onNext = () => {
    let idx = pageIndex + 1
    changePage(Math.min(pagesRaw.length - 1, idx))
  }

  const saveDraftSafe = async () => {
    setSaving(true)
    setError(null)
    try {
      // Готовим ответы к сохранению под каноническими ключами (это уже answers)
      await (api as any).saveSurveyDraft?.(token, {
        answers,
        respondentMeta: { wizardPageIndex: pageIndex, draft: true, progress },
      })
    } catch (e: any) {
      console.error('saveDraftError', e)
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
        respondentMeta: { wizardPageIndex: pageIndex, submittedAt: new Date().toISOString(), progress },
      })
      window.location.href = `/survey/${encodeURIComponent(token)}/results`
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Ошибка отправки')
    } finally {
      setSaving(false)
    }
  }

  const finishIfConfirmed = async () => {
    const warnThreshold = 95
    if (progress < warnThreshold) {
      const ok = window.confirm(`Вы завершили опрос только на ${progress}%. Уверены, что хотите отправить?`)
      if (!ok) return
    }
    await submit()
  }

  if (!schema || schema.version !== 'v2') return <div className="card error">Это не v2‑схема</div>
  if (!pagesRaw.length || !page) return <div className="card error">UI не загружен</div>

  const logoUrl = (ui?.brand && ui.brand.logoUrl) || '/logo_elbrus.png'

  if (page.kind === 'cover') {
    return (
      <div className="v2-doc">
        <div className="v2-doc__header">
          <div className="v2-brand">
            <img className="v2-brand__logo v2-brand__logo--lg" src={logoUrl} alt="Эльбрус" />
            <span className="v2-brand__title">Эльбрус</span>
          </div>
          <div className="v2-progress">Прогресс: {progress}%</div>
        </div>

        <div className="v2-card v2-card--hero">
          <div className="v2-h1">ЗАЯВЛЕНИЕ — ВОПРОСНИК</div>
          <div className="v2-logo v2-logo--huge">
            <img src={logoUrl} alt="Эльбрус" />
          </div>
          <div className="v2-h2">НА СТРАХОВАНИЕ ИНФОРМАЦИОННЫХ (КИБЕР) РИСКОВ</div>
          <div className="v2-actions">
            <button className="btn btn-primary" onClick={() => changePage(firstWorkIndexGlobal)} type="button">
              {page.primaryActionLabel ?? 'Начать'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (page.kind === 'result') {
    return (
      <div className="v2-doc">
        <div className="v2-doc__header">
          <div className="v2-brand">
            <img className="v2-brand__logo v2-brand__logo--lg" src={logoUrl} alt="Эльбрус" />
            <span className="v2-brand__title">Эльбрус</span>
          </div>
          <div className="v2-progress">Прогресс: {progress}%</div>
        </div>

        <h2 className="v2-section-title">{page.title ?? 'Результат'}</h2>
        <div className="v2-actions">
          <button
            className="btn btn-secondary"
            disabled={pageIndex <= firstWorkIndexGlobal || saving}
            onClick={onPrev}
            type="button"
          >
            Назад
          </button>
          <button className="btn btn-outline" disabled={saving} onClick={saveDraftSafe} type="button">
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>

        {error ? <div className="v2-error">{error}</div> : null}
      </div>
    )
  }

  const vm = buildSectionQuestions(schema, presentation, page.presentationSectionKey)

  const isLastWorkPage =
    workPagesForPager.length > 0 &&
    page.kind !== 'cover' &&
    page.kind !== 'result' &&
    pageIndex === workPagesForPager[workPagesForPager.length - 1].i

  return (
    <div className="v2-doc">
      <div className="v2-doc__header">
        <div className="v2-brand">
          <img className="v2-brand__logo v2-brand__logo--lg" src={logoUrl} alt="Эльбрус" />
          <span className="v2-brand__title">Эльбрус</span>
        </div>
        <div className="v2-progress">Прогресс: {progress}%</div>
      </div>

      <div className="v2-section-title">{vm.title}</div>

      {vm.subsections.map((sub: any) => (
        <div key={sub.key} className="v2-subsection">
          {sub.title ? <div className="v2-subtitle">{sub.title}</div> : null}

          {sub.groups.map((g: any) => (
            <div key={g.key} className="v2-group">
              {g.title ? <div className="v2-group-title">{g.title}</div> : null}

              <div className="v2-table">
                {g.questions.map((q: UiQuestion) => {
                    const prefix = extractIdPrefix(q.id)
                    const isSection1 = q.sectionKey === 'general_applicant'
                    const rowKey = canonicalId(q.id) // безопасный ключ строки
                    return (
                      <div key={rowKey} className="v2-row">
                        <div className="v2-cell v2-cell--q">
                          {!isSection1 && prefix ? <div className="v2-idbadge">{prefix}</div> : null}
                          <div className="v2-qtext">{q.text}</div>
                          {q.helpText ? <div className="v2-help">{q.helpText}</div> : null}
                        </div>
                        <div className="v2-cell v2-cell--a">
                          <QuestionRenderer
                            question={{ ...q, id: canonicalId(q.id) }} // передаем канонический id внутрь рендера
                            value={answers[canonicalId(q.id)]}
                            onChange={(v: any) => setAnswer(q.id, v, q.answerType)}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="v2-actions">
        <div className="v2-pager">
          {workPagesForPager.map(({ p, i }: { p: any; i: number }, idx: number) => (
            <button
              key={p.key ?? i}
              type="button"
              className={`v2-pager__dot ${i === pageIndex ? 'is-active' : ''}`}
              onClick={() => changePage(i)}
            >
              {p.title ?? String(idx + 1)}
            </button>
          ))}
        </div>

        <button
          className="btn btn-secondary"
          disabled={pageIndex <= firstWorkIndexGlobal || saving}
          onClick={onPrev}
          type="button"
        >
          Назад
        </button>
        {!isLastWorkPage && (
          <button className="btn btn-outline" disabled={saving} onClick={saveDraftSafe} type="button">
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        )}
        {!isLastWorkPage && (
          <button className="btn btn-primary" disabled={saving} onClick={onNext} type="button">
            Далее
          </button>
        )}

        {isLastWorkPage && (
          <>
            <button className="btn btn-outline" disabled={saving} onClick={saveDraftSafe} type="button">
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button className="btn btn-primary" disabled={saving} onClick={finishIfConfirmed} type="button">
              Завершить
            </button>
          </>
        )}
      </div>

      {error ? <div className="v2-error">{error}</div> : null}
    </div>
  )
}
