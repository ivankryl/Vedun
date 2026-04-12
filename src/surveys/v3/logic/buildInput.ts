// ===== src/surveys/v3/logic/buildInput.ts =====
import type {
  SurveyTemplate,
  Question,
  Section,
  ChoiceQuestion,
  MultiSelectQuestion
} from '../types'
import type { ComputeInput, Level, QuestionAnswer } from './types'

// Канонизация id (та же, что вы используете в Wizard)
const canonicalId = (raw: string) => {
  let s = String(raw).trim().toLowerCase()
  s = s.replace(/s@/g, 's0')
  s = s.replace(/\s+/g, '_')
  s = s.replace(/[^a-z0-9._-]/g, '_')
  s = s.replace(/__+/g, '_').replace(/\.\.+/g, '.').replace(/--+/g, '-')
  return s
}

const z2 = (n: number | string) => String(n).padStart(2, '0')

// Из id вытаскиваем секцию NN, уровень L и номер вопроса Q (если нужно)
function parseId(id?: string): null | { sec: string; L: Level; q?: number } {
  if (!id) return null
  const s = canonicalId(id)
  const mSec = s.match(/^s(\d{1,2})(?=[._-])/)
  const mLvl = s.match(/[.-_]l(\d{1,2})(?=[._-]q\d+\b)/)
  if (!mSec || !mLvl) return null
  const sec = z2(mSec[1])
  const L = Number(mLvl[1]) as Level
  const mQ = s.match(/[._-]q(\d{1,3})\b/)
  return { sec, L, q: mQ ? Number(mQ[1]) : undefined }
}

// Узкое получение options — только для тех подтипов, где они есть
function getOptionsOf(question: Question | undefined): Array<{ id: string; points?: number; weight?: number }> {
  if (!question) return []
  if (question.answerType === 'radio' || question.answerType === 'select') {
    return (question as ChoiceQuestion).options ?? []
  }
  if (question.answerType === 'multi_select') {
    return (question as MultiSelectQuestion).options ?? []
  }
  return []
}

// Главная функция: answers + schema -> ComputeInput
export function buildComputeInputFromV3(params: {
  schema: SurveyTemplate
  answers: Record<string, any> // ключи — как в Wizard (canonicalId)
}): ComputeInput {
  const { schema, answers } = params

  // Секции: используем schema.sections[].key
  const sections = (schema.sections ?? []).map((s: Section) => s.key)

  // Карта NN -> section.key (предполагаем соответствие порядку)
  const nnToSectionKey = new Map<string, string>()
  ;(schema.sections ?? []).forEach((s: Section, idx: number) => {
    const nn = z2(idx + 1)
    nnToSectionKey.set(nn, s.key)
  })

  // Подготовим структуры
  const answersBySection: ComputeInput['answersBySection'] = {}
  const processBySection: ComputeInput['processBySection'] = {}
  const targetsBySection: ComputeInput['targetsBySection'] = {}

  // Инициализация контейнеров — ОБЯЗАТЕЛЬНО с sectionKey
  for (const key of sections) {
    answersBySection[key] = { sectionKey: key, levels: {} as any }
    processBySection[key] = { sectionKey: key, levels: {} as any }
    targetsBySection[key] = { sectionKey: key, targetLevel: 5 as Level }
  }

  // Быстрый доступ к опциям yes/no/na
  function pickOptionFor(
    question: Question | undefined,
    answerId: unknown
  ): { points: 0 | 1; weight: 0 | 1 } {
    // boolean приходит для чекбоксов согласий — сведём к yes/no с весом 1
    if (typeof answerId === 'boolean') {
      return { points: answerId ? 1 : 0, weight: 1 }
    }

    const opts = getOptionsOf(question)

    // Множественный выбор (multi_select) — ответ может прийти массивом
    if (Array.isArray(answerId)) {
      const ids = answerId.map(v => String(v || '').toLowerCase())
      // Если явно есть 'na' и нет положительных — считаем НП
      if (ids.includes('na')) {
        // Проверим, есть ли положительные опции
        const hasYes = ids.some(id => {
          const f = opts.find(o => o.id === id)
          return f ? (f.points ?? 0) > 0 && (f.weight ?? 1) > 0 : id === 'yes'
        })
        if (!hasYes) return { points: 1, weight: 0 } // НП
      }
      // Если есть любая положительная опция — yes
      const hasPositive = ids.some(id => {
        const f = opts.find(o => o.id === id)
        if (f) return (f.points ?? 0) > 0 && (f.weight ?? 1) > 0
        return id === 'yes'
      })
      return hasPositive ? { points: 1, weight: 1 } : { points: 0, weight: 1 }
    }

    // Обычный строковый ответ
    const id = String(answerId || '').toLowerCase()
    const found = opts.find(o => o.id === id)
    if (found && typeof found.points !== 'undefined' && typeof found.weight !== 'undefined') {
      return {
        points: (found.points ? 1 : 0) as 0 | 1,
        weight: (found.weight ? 1 : 0) as 0 | 1
      }
    }

    // Fallback на стандарт yes/no/na
    if (id === 'yes') return { points: 1, weight: 1 }
    if (id === 'no') return { points: 0, weight: 1 }
    if (id === 'na') return { points: 1, weight: 0 }

    // Иное — считаем невыполненным, но с весом 1
    return { points: 0, weight: 1 }
  }

  // Индекс вопросов по id
  const allQuestions: Question[] = (schema.sections ?? []).flatMap(s => s.questions ?? [])
  const qById = new Map(allQuestions.map(q => [canonicalId(q.id), q]))

  // answers: ключи уже канонизированы в Wizard
  for (const [rawKey, rawValue] of Object.entries(answers || {})) {
    const q = qById.get(canonicalId(rawKey))
    if (!q) continue
    const p = parseId(q.id)
    if (!p) continue

    const sectionKey = nnToSectionKey.get(p.sec)
    if (!sectionKey) continue

    const arr: QuestionAnswer[] = answersBySection[sectionKey].levels[p.L] || []

    const picked = pickOptionFor(q, rawValue)
    const answerId: QuestionAnswer['answer'] =
      picked.weight === 0 ? 'na' : picked.points === 1 ? 'yes' : 'no'

    const qa: QuestionAnswer = {
      id: q.id,
      answer: answerId,
      weight: picked.weight
    }

    arr.push(qa)
    answersBySection[sectionKey].levels[p.L] = arr
  }

  // Собираем ComputeInput (без sectionMap)
  const input: ComputeInput = {
    sections,
    answersBySection,
    processBySection,
    targetsBySection,
    hygieneMinLevel: 2
  }

  return input
}
