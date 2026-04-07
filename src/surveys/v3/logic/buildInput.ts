// ===== src/surveys/v3/logic/buildInput.ts =====
import type { SurveyTemplate, Question, Section } from '../../components/survey/v3/types'
import type { ComputeInput, Level } from './types'

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

// Построить карту секций (для валидации опций и удобного доступа)
export function buildSectionMap(schema: SurveyTemplate) {
  const byKey: Record<string, { questions: Question[] }> = {}
  for (const s of schema.sections ?? []) {
    byKey[s.key] = { questions: [...(s.questions ?? [])] }
  }
  return byKey
}

// Главная функция: answers + schema -> ComputeInput
export function buildComputeInputFromV3(params: {
  schema: SurveyTemplate
  answers: Record<string, any> // ключи — как в Wizard (canonicalId)
}): ComputeInput {
  const { schema, answers } = params

  // Секции: используем schema.sections[].key
  const sections = (schema.sections ?? []).map((s: Section) => s.key)

  // Индекс секцией по NN (из id) -> ключ секции из схемы
  // Предположим, что порядок schema.sections соответствует NN (01 -> sections[0], 02 -> sections[1], ...).
  // Если у вас другая связь, заведите явную карту NN -> section.key.
  const nnToSectionKey = new Map<string, string>()
  ;(schema.sections ?? []).forEach((s: Section, idx: number) => {
    const nn = z2(idx + 1)
    nnToSectionKey.set(nn, s.key)
  })

  // Подготовим ответные структуры
  const answersBySection: ComputeInput['answersBySection'] = {}
  const processBySection: ComputeInput['processBySection'] = {}
  const targetsBySection: ComputeInput['targetsBySection'] = {}

  // sectionMap — для мягкой валидации опций (validateYesNoNaOptions)
  const sectionMap = buildSectionMap(schema)

  // Инициализация контейнеров
  for (const key of sections) {
    answersBySection[key] = { levels: {} as any }
    processBySection[key] = { levels: {} as any } // если процессных данных нет — оставим пустым
    targetsBySection[key] = { targetLevel: 5 as Level }
  }

  // Быстрый доступ к опциям (yes/no/na) из вопроса
  function pickOptionFor(question: Question | undefined, answerId: string | boolean): { points: 0 | 1; weight: 0 | 1 } {
    // boolean приходит для чекбоксов согласий — сведём к points/weight
    if (typeof answerId === 'boolean') {
      return { points: answerId ? 1 : 0, weight: 1 }
    }
    const id = String(answerId || '').toLowerCase()
    const opts = (question?.options ?? []) as Array<{ id: string; points: 0 | 1; weight: 0 | 1 }>
    const found = opts.find(o => o.id === id)
    if (found) return { points: found.points, weight: found.weight }
    // Fallback на стандарт yes/no/na
    if (id === 'yes') return { points: 1, weight: 1 }
    if (id === 'no') return { points: 0, weight: 1 }
    if (id === 'na') return { points: 1, weight: 0 }
    // Если что-то иное — считаем невыполненным, но с весом 1
    return { points: 0, weight: 1 }
  }

  // Пройдёмся по всем вопросам схемы и соберём массивы по уровням
  const allQuestions = (schema.sections ?? []).flatMap(s => (s.questions ?? []))
  const qById = new Map(allQuestions.map(q => [canonicalId(q.id), q]))

  // answers: ключи уже канонизированы в Wizard
  for (const [rawKey, rawValue] of Object.entries(answers || {})) {
    const q = qById.get(canonicalId(rawKey))
    if (!q) continue
    const p = parseId(q.id)
    if (!p) continue

    const sectionKey = nnToSectionKey.get(p.sec)
    if (!sectionKey) continue

    const lvlArr = answersBySection[sectionKey].levels[p.L] || []
    const opt = pickOptionFor(q, rawValue)
    lvlArr.push(opt)
    answersBySection[sectionKey].levels[p.L] = lvlArr
  }

  // Собираем ComputeInput
  const input: ComputeInput = {
    sections,
    answersBySection,
    processBySection,
    targetsBySection,
    sectionMap,           // для validateYesNoNaOptions
    hygieneMinLevel: 2,   // дефолт, как в computeCompanyMaturity
  }

  return input
}
