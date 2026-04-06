// frontend/src/components/survey/PublicSurveyWizardV3.tsx
import React from 'react'
import * as api from '../../services/api'
import './v3/survey-v3.css'
import QuestionRenderer from './QuestionRenderer'
import type { SurveyTemplate, Question, AnswerType, Section } from './v3/types'

type UiQuestion = Question
type GroupVM = { key: string; title?: string; questions: UiQuestion[] }

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
    respondentMeta?: { wizardPageIndex?: number; defaults?: Record<string, any>; draft?: boolean }
  }
  ui: any
  presentation: Presentation
  onProgressChange?: (percent: number) => void
}

// Отладка: ?debug=1 или localStorage.DEBUG_SURVEY_V3=1
function isDebug(): boolean {
  const q = new URLSearchParams((typeof window !== 'undefined' ? window.location.search : '') || '')
  if (q.get('debug') === '1') return true
  try { return localStorage.getItem('DEBUG_SURVEY_V3') === '1' } catch { return false }
}
const DBG = isDebug()
const dbg = (...args: any[]) => { if (DBG) console.debug('[V3]', ...args) }
const warn = (...args: any[]) => { if (DBG) console.warn('[V3]', ...args) }

// Флаг «показать все вопросы»
function isForceAll(): boolean {
  const q = new URLSearchParams((typeof window !== 'undefined' ? window.location.search : '') || '')
  if (q.get('all') === '1') return true
  try { return localStorage.getItem('SURVEY_V3_FORCE_ALL') === '1' } catch { return false }
}

function canonicalId(raw: string): string {
  let s = String(raw).trim().toLowerCase()
  s = s.replace(/s@/g, 's0')
  s = s.replace(/\s+/g, '_')
  s = s.replace(/[^a-z0-9._-]/g, '_')
  s = s.replace(/__+/g, '_').replace(/\.\.+/g, '.').replace(/--+/g, '-')
  return s
}

// === Бейдж NN.LL.QQ полностью из id (только формат sNN.*.lM.qK) ===
const z2 = (n: string | number) => String(n).padStart(2, '0')

// Пример: 's01.org.l1.q1' -> '01.01.01'
function badgeFromIdStrict(id?: string): string | null {
  if (!id) return null
  const s = id.trim().toLowerCase()

  // sNN в начале
  const mSec = s.match(/^s(\d{1,2})(?=[._-])/)
  // lM непосредственно перед qK
  const mLvl = s.match(/[._-]l(\d{1,2})(?=[._-]q\d+\b)/)
  // qK
  const mQ = s.match(/[._-]q(\d{1,2})\b/)

  if (mSec && mLvl && mQ) {
    return `${z2(mSec[1])}.${z2(mLvl[1])}.${z2(mQ[1])}`
  }
  return null
}

type SubsectionVM = {
  key: string
  title?: string
  blocks: any[]
  groups: GroupVM[]
  __debug?: {
    totalQuestions: number
    matchedKeys: string[]
    fallbackUsed?: 'forceAll' | 'allTemplate'
  }
}

function buildSectionQuestions(
  schema: SurveyTemplate | undefined,
  presentation: Presentation,
  presentationSectionKey: string
) {
  const pres = (presentation.sections ?? []).find((s) => s.key === presentationSectionKey)
  if (!pres) {
    warn('Presentation section not found:', presentationSectionKey)
    return { title: presentationSectionKey, blocks: [], subsections: [] as SubsectionVM[] }
  }

  const sections = schema?.sections ?? []
  const byKey = new Map<string, Section>(sections.map((s: Section) => [s.key, s]))

  const forceAll = isForceAll()
  dbg('Presentation section:', { key: pres.key, title: pres.title, sectionKeys: pres.sectionKeys, forceAll })

  const collectExact = (sectionKeys: string[]) => {
    const matched: string[] = []
    const out: UiQuestion[] = []
    for (const k of sectionKeys) {
      const sec = byKey.get(k)
      if (!sec) { warn('Section key from presentation not found in schema:', k); continue }
      matched.push(sec.key)
      out.push(...(sec.questions ?? []))
    }
    const uniq = new Map(out.map((q) => [canonicalId(q.id), q]))
    return { questions: Array.from(uniq.values()), matchedKeys: matched }
  }

  const groupByCategory = (questions: UiQuestion[], grouping: any): GroupVM[] => {
    try {
      if (!grouping) return [{ key: 'all', title: '', questions }]
      if (grouping.type === 'byCategoryKey') {
        const remaining = new Map(questions.map((q) => [canonicalId(q.id), q]))
        const groups: GroupVM[] = (grouping.groups ?? []).map(
          (g: { key: string; title?: string; categoryKeys?: string[] }) => {
            const keys = g.categoryKeys ?? []
            const qs = questions.filter((q) => keys.includes(q.categoryKey as string))
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
        const groups: GroupVM[] = (grouping.groups ?? []).map(
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
    } catch (e) {
      warn('groupByCategory error:', e)
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

  const subsections: SubsectionVM[] = subsectionsRaw.map((sub: {
    key: string
    title?: string
    blocks?: any[]
    sectionKeys?: string[]
    questionGrouping?: any
  }) => {
    const allTemplateQuestions = (schema?.sections ?? []).flatMap((s) => s.questions ?? [])

    // forceAll — показываем все вопросы шаблона
    if (forceAll) {
      const qs = Array.from(new Map(allTemplateQuestions.map((q) => [canonicalId(q.id), q])).values())
      const groups = groupByCategory(qs, sub.questionGrouping)
      return {
        key: sub.key,
        title: sub.title,
        blocks: sub.blocks ?? [],
        groups,
        __debug: {
          totalQuestions: qs.length,
          matchedKeys: [],
          fallbackUsed: 'forceAll',
        }
      }
    }

    // Строго по sectionKeys
    const exactKeys = (sub.sectionKeys ?? []).filter(Boolean)
    const res = collectExact(exactKeys)
    let questions = res.questions
    let fallbackUsed: SubsectionVM['__debug'] extends infer D
      ? D extends object
        ? D extends { fallbackUsed?: infer F } ? F : undefined
        : undefined
      : undefined

    // Fallback: если пусто — берём весь шаблон
    if (questions.length === 0 && allTemplateQuestions.length > 0) {
      warn('No questions matched by presentation.sectionKeys, falling back to ALL template questions for:', pres.key)
      questions = Array.from(new Map(allTemplateQuestions.map((q) => [canonicalId(q.id), q])).values())
      fallbackUsed = 'allTemplate'
    }

    const groups = groupByCategory(questions, sub.questionGrouping)
    const totalInGroups = groups.reduce<number>((acc, g) => acc + ((g.questions?.length) || 0), 0)
    dbg('Groups built:', { count: groups.length, totalInGroups })

    return {
      key: sub.key,
      title: sub.title,
      blocks: sub.blocks ?? [],
      groups,
      __debug: {
        totalQuestions: questions.length,
        matchedKeys: res.matchedKeys,
        fallbackUsed,
      }
    }
  })

  return { title: pres.title ?? pres.key, blocks: pres.blocks ?? [], subsections }
}

function castAnswer(answerType: AnswerType, raw: any) {
  if (answerType === 'number') return raw === '' ? null : Number(raw)
  if (answerType === 'boolean') {
    if (raw === true || raw === 'true') return true
    if (raw === false || raw === 'false') return false
    return null
  }
  if (answerType === 'multi_select' || (answerType as any) === 'multiselect') return Array.isArray(raw) ? raw : raw ? [raw] : []
  if (answerType === 'radio' || answerType === 'select') return raw ?? ''
  if (answerType === 'date') return raw || null
  if (answerType === 'table') return Array.isArray(raw) ? raw : []
  return raw ?? ''
}


export default function PublicSurveyWizardV3({ token, data, ui, presentation, onProgressChange }: Props) {
  // Исходная схема из link.survey.schema
  const schema: SurveyTemplate | undefined = data?.survey?.schema as SurveyTemplate | undefined
  // Шаблон из UI (SURVEY_TEMPLATE_V3)
  const uiTemplate: SurveyTemplate | undefined = (ui?.data?.template as unknown) as SurveyTemplate | undefined

  // Эффективная схема:
  const effectiveSchema: SurveyTemplate | undefined = React.useMemo(() => {
    const hasSections = (x: any) => x && Array.isArray(x.sections) && x.sections.length > 0
    // ПРИОРИТЕТ: uiTemplate (v3) → schema (link)
    if (uiTemplate && String(uiTemplate.version).toLowerCase() === 'v3' && hasSections(uiTemplate)) return uiTemplate
    if (schema && String(schema.version).toLowerCase() === 'v3' && hasSections(schema)) return schema
    return uiTemplate ?? schema
  }, [schema, uiTemplate])

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

  React.useEffect(() => {
    const ver = (effectiveSchema as any)?.version
    dbg('Init schema version (effective):', ver, 'pages:', pagesRaw.length, 'current page:', page?.presentationSectionKey, 'forceAll=', isForceAll())
    if (effectiveSchema?.sections && DBG) {
      const keys = effectiveSchema.sections.map((s: Section) => s.key)
      dbg('Schema section keys (effective):', keys)
    }
  }, [effectiveSchema, pagesRaw, page])

  const setAnswer = (id: string, raw: any, answerType?: AnswerType) => {
    const key = canonicalId(id)
    const casted = answerType ? castAnswer(answerType, raw) : raw
    setAnswers((prev: Record<string, any>) => {
      if (prev[key] === casted) return prev
      return { ...prev, [key]: casted }
    })
  }

  const allQuestions: UiQuestion[] = React.useMemo(() => {
    const secs = effectiveSchema?.sections ?? []
    const flat = secs.flatMap((s: Section) => s?.questions ?? [])
    const uniq = new Map(flat.map((q) => [canonicalId(q.id), q]))
    return Array.from(uniq.values())
  }, [effectiveSchema])

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
      await api.saveSurveyDraftByToken(token, {
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
      await api.submitSurveyByToken(token, {
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
      await submit()
    }
  }

  const schemaVersion = (effectiveSchema as any)?.version
  const isV3 = String(schemaVersion).toLowerCase() === 'v3' || String(schemaVersion) === '3'
  if (!effectiveSchema || !isV3) return <div className="card error">Это не v3‑схема</div>
  if (!pagesRaw.length || !page) return <div className="card error">UI не загружен</div>

  const logoUrl = (ui?.brand && ui.brand.logoUrl) || '/logo_vedun.png'
  const vm = buildSectionQuestions(effectiveSchema, presentation, page.presentationSectionKey)

  const totalQuestionsOnPage = vm.subsections.reduce<number>(
    (acc, s: SubsectionVM) => acc + (s.__debug?.totalQuestions || 0),
    0
  )

  const isLastWorkPage =
    workPagesForPager.length > 0 &&
    page.kind !== 'cover' &&
    page.kind !== 'result' &&
    pageIndex === workPagesForPager[workPagesForPager.length - 1].i

  if (page.kind === 'cover') {
    const hasAnyAnswers = Object.keys(normalizedInitialAnswers || {}).length > 0
    const hasWizardIndex =
      typeof initialIndexFromMeta === 'number' && initialIndexFromMeta > firstWorkIndexGlobal
    const hasDraftFlag = Boolean((data as any)?.respondentMeta?.draft)
    const hasProgress = hasAnyAnswers || hasWizardIndex || hasDraftFlag

    return (
      <div className="v3-doc">
        <div className="v3-doc__header">
          <div className="v3-brand">
            <img className="v3-brand__logo v3-brand__logo--lg" src={logoUrl} alt="Vedun" />
            <span className="v3-brand__title">Ведун</span>
          </div>
          <div className="v3-progress">Прогресс: {progress}%</div>
        </div>

        <div className="v3-card v3-card--hero">
          <div className="v3-h1">КИБЕР-ОПРОСНИК</div>
          <div className="v3-logo v3-logo--huge">
            <img src={logoUrl} alt="Vedun" />
          </div>
          <div className="v3-h2">Оценка рисков и уязвимостей (v3)</div>
          <div className="v3-actions">
            <button className="btn btn-primary" onClick={() => changePage(firstWorkIndexGlobal)} type="button">
              {hasProgress ? 'Продолжить' : (page.primaryActionLabel ?? 'Начать')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (page.kind === 'result') {
    return (
      <div className="v3-doc">
        <div className="v3-doc__header">
          <div className="v3-brand">
            <img className="v3-brand__logo v3-brand__logo--lg" src={logoUrl} alt="Vedун" />
            <span className="v3-brand__title">Ведун</span>
          </div>
          <div className="v3-progress">Прогресс: {progress}%</div>
        </div>

        <h2 className="v3-section-title">{page.title ?? 'Результат'}</h2>
        <div className="v3-actions">
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

        {error ? <div className="v3-error">{error}</div> : null}
      </div>
    )
  }

  return (
    <div className="v3-doc">
      <div className="v3-doc__header">
        <div className="v3-brand">
          <img className="v3-brand__logo v3-brand__logo--lg" src={logoUrl} alt="Vedun" />
          <span className="v3-brand__title">Ведун</span>
        </div>
        <div className="v3-progress">Прогресс: {progress}%</div>
      </div>

      <div className="v3-section-title">{vm.title}</div>

      {DBG && totalQuestionsOnPage === 0 ? (
        <div className="card" style={{ padding: 12, marginBottom: 16 }}>
          <div><b>DEBUG:</b> вопросов на странице: 0</div>
          <div>presentationSectionKey: <code>{page.presentationSectionKey}</code></div>
          <div>schema source: <code>{effectiveSchema === uiTemplate ? 'ui.data.template (preferred)' : 'link.survey.schema (fallback)'}</code></div>
          <div>forceAll: <code>{String(isForceAll())}</code></div>
        </div>
      ) : null}

      {vm.subsections.map((sub: any) => (
        <div key={sub.key} className="v3-subsection">
          {sub.title ? <div className="v3-subtitle">{sub.title}</div> : null}

          {sub.blocks?.length ? (
            <div className="v3-blocks">
              {sub.blocks.map((b: any, i: number) => (
                <div key={i} className="v3-block v3-block--text">
                  {b?.text ?? ''}
                </div>
              ))}
            </div>
          ) : null}

          {sub.groups.map((g: any) => (
            <div key={g.key} className="v3-group">
              {g.title ? <div className="v3-group-title">{g.title}</div> : null}

              <div className="v3-table">
                {g.questions.map((q: UiQuestion) => {
                  const badge = badgeFromIdStrict(q.id)
                  const rowKey = canonicalId(q.id)
                  return (
                    <div key={rowKey} className="v3-row">
                      <div className="v3-cell v3-cell--q">
                        {badge ? <div className="v3-idbadge">{badge}</div> : null}
                        <div className="v3-qtext">{q.text}</div>
                        {q.helpText ? <div className="v3-help">{q.helpText}</div> : null}
                      </div>
                      <div className="v3-cell v3-cell--a">
                        <QuestionRenderer
                          question={{ ...q, id: canonicalId(q.id) }}
                          value={answers[canonicalId(q.id)]}
                          onChange={(v: any) => setAnswer(q.id, v, q.answerType)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {DBG && g.questions.length === 0 ? (
                <div className="v3-help" style={{ color: '#a00' }}>
                  DEBUG: группа пустая — проверьте presentation.sectionKeys и schema.sections[].key
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}

      <div className="v3-actions">
        <div className="v3-pager">
          {workPagesForPager.map(({ p, i }: { p: any; i: number }, idx: number) => (
            <button
              key={p.key ?? i}
              type="button"
              className={`v3-pager__dot ${i === pageIndex ? 'is-active' : ''}`}
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
          <>
            <button className="btn btn-outline" disabled={saving} onClick={saveDraftSafe} type="button">
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button className="btn btn-primary" disabled={saving} onClick={onNext} type="button">
              Далее
            </button>
          </>
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

      {error ? <div className="v3-error">{error}</div> : null}
    </div>
  )
}
