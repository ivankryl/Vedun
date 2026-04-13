// src/surveys/v3/logic/buildInput.ts
import type {
  SurveyTemplate,
  Question,
  Section,
  ChoiceQuestion,
  MultiSelectQuestion
} from '../types'
import type { ComputeInput, Level, QuestionAnswer } from './types'


const S_CODE_TO_PROCESS_KEY: Record<string, string> = {
  '01': 'org_structure',
  '02': 'it_asset_mgmt',
  '03': 'risk_based',
  '04': 'security_architecture',
  '05': 'security_strategy',
  '06': 'reporting_metrics',
  '07': 'change_mgmt',
  '08': 'access_mgmt',
  '09': 'network_security',
  '10': 'endpoint_security',
  '11': 'data_security',
  '12': 'security_monitoring',
  '13': 'vulnerability_mgmt',
  '14': 'pentesting',
  '15': 'incident_mgmt',
  '16': 'security_culture',
};


// Канонизация id
const canonicalId = (raw: string) => {
  let s = String(raw).trim().toLowerCase()
  s = s.replace(/s@/g, 's0')
  s = s.replace(/\s+/g, '_')
  s = s.replace(/[^a-z0-9._-]/g, '_')
  s = s.replace(/__+/g, '_').replace(/\.\.+/g, '.').replace(/--+/g, '-')
  return s
}

const z2 = (n: number | string) => String(n).padStart(2, '0')

// sNN, L и Q из id (только для вопросов формата sNN.xxx.lK.qM)
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

// ГЛАВНОЕ: берём ТОЛЬКО секции s01..s16 — по факту вопросов в схеме
export function buildComputeInputFromV3(params: {
  schema: SurveyTemplate
  answers: Record<string, any>
}): ComputeInput {
  const { schema, answers } = params

  // Индекс секций и вопросов
  const sectionsArr: Section[] = (schema.sections ?? [])
  const sectionByKey = new Map(sectionsArr.map((s) => [s.key, s]))
  const allQuestions: Question[] = sectionsArr.flatMap((s) => s.questions ?? [])

  // Карта NN -> sectionKey по реальным вопросам (исключаем 00/99 и любые без sNN.lK.qM)
  const nnToSectionKey = new Map<string, string>()
  for (const s of sectionsArr) {
    for (const q of (s.questions ?? [])) {
      const p = parseId(q.id)
      if (!p) continue
      // В v3 учитываем только s01..s16
      const nn = p.sec
      const n = Number(nn)
      if (Number.isFinite(n) && n >= 1 && n <= 16) {
        if (!nnToSectionKey.has(nn)) {
            const mapped = S_CODE_TO_PROCESS_KEY[nn];
            if (mapped) {
              nnToSectionKey.set(nn, mapped);
            } else {
              nnToSectionKey.set(nn, s.key); // fallback
            }
        }
      }
    }
  }

  // Итоговый список секций: в порядке NN
  const orderedNN = Array.from(nnToSectionKey.keys()).sort((a, b) => Number(a) - Number(b))
  const sections = orderedNN.map((nn) => nnToSectionKey.get(nn)!).filter(Boolean)

  // Контейнеры только для оценочных секций
  const answersBySection: ComputeInput['answersBySection'] = {}
  const processBySection: ComputeInput['processBySection'] = {}
  const targetsBySection: ComputeInput['targetsBySection'] = {}
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
    if (typeof answerId === 'boolean') {
      return { points: answerId ? 1 : 0, weight: 1 }
    }
    const opts = getOptionsOf(question)
    if (Array.isArray(answerId)) {
      const ids = answerId.map(v => String(v || '').toLowerCase())
      if (ids.includes('na')) {
        const hasYes = ids.some(id => {
          const f = opts.find(o => o.id === id)
          return f ? (f.points ?? 0) > 0 && (f.weight ?? 1) > 0 : id === 'yes'
        })
        if (!hasYes) return { points: 1, weight: 0 }
      }
      const hasPositive = ids.some(id => {
        const f = opts.find(o => o.id === id)
        if (f) return (f.points ?? 0) > 0 && (f.weight ?? 1) > 0
        return id === 'yes'
      })
      return hasPositive ? { points: 1, weight: 1 } : { points: 0, weight: 1 }
    }
    const id = String(answerId || '').toLowerCase()
    const found = opts.find(o => o.id === id)
    if (found && typeof found.points !== 'undefined' && typeof found.weight !== 'undefined') {
      return {
        points: (found.points ? 1 : 0) as 0 | 1,
        weight: (found.weight ? 1 : 0) as 0 | 1
      }
    }
    if (id === 'yes') return { points: 1, weight: 1 }
    if (id === 'no') return { points: 0, weight: 1 }
    if (id === 'na') return { points: 1, weight: 0 }
    return { points: 0, weight: 1 }
  }

  // Индекс вопросов по id
  const qById = new Map(allQuestions.map(q => [canonicalId(q.id), q]))

  // answers: ключи уже канонизированы в Wizard
  for (const [rawKey, rawValue] of Object.entries(answers || {})) {
    const q = qById.get(canonicalId(rawKey))
    if (!q) continue
    const p = parseId(q.id)
    if (!p) continue

    // Берём только те, чьи секции присутствуют в nnToSectionKey (т.е. s01..s16)
    const sectionKey = nnToSectionKey.get(p.sec)
    if (!sectionKey) continue

    const arr: QuestionAnswer[] = answersBySection[sectionKey].levels[p.L] || []
    const picked = pickOptionFor(q, rawValue)
    const answerId: QuestionAnswer['answer'] =
      picked.weight === 0 ? 'na' : picked.points === 1 ? 'yes' : 'no'

    arr.push({ id: q.id, answer: answerId, weight: picked.weight })
    answersBySection[sectionKey].levels[p.L] = arr
  }

  const input: ComputeInput = {
    sections,
    answersBySection,
    processBySection,
    targetsBySection,
    hygieneMinLevel: 2
  }

  return input
}
