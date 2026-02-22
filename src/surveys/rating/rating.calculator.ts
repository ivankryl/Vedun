// src/surveys/rating/rating.calculator.ts

type AnswerValue = string | string[] | number | boolean | null

export type AnswersMap = Record<string, AnswerValue>

export interface V2Option {
  id: string
  label: string
  points?: number // 0..1 (как у тебя)
  weight?: number // 0..1 или 1; если не задано -> 1
}

export interface V2Question {
  id: string
  sectionKey: string
  categoryKey?: string
  text: string
  answerType: string // 'radio' | 'select' | ...
  validation?: { required?: boolean }
  options?: V2Option[]
}

export interface V2Section {
  key: string
  title: string
  order: number
  questions: V2Question[]
}

export interface V2TemplateLike {
  version: string
  title: string
  sections: V2Section[]
}

export interface SectionRating {
  sectionKey: string
  score: number // накопленные points*weight
  weight: number // накопленные weight
  rating: number | null // score/weight (0..1), null если нет ответов
  answeredCount: number
  questionCount: number
  missingRequiredIds: string[]
}

export class RatingCalculator {
  static calculateBySections(
    template: V2TemplateLike,
    answers: AnswersMap,
    opts?: {
      excludeSectionKeys?: string[] // например ['general']
      // по умолчанию исключаем 00/01/25/26 (см. ниже)
    },
  ): {
    sectionRatings: Record<string, SectionRating>
  } {
    const defaultExcluded = new Set<string>([
        'general',               // 00
        'insurance_protection',  // 01
        'financial_metrics',     // 25
        'open_notes_attachments' // 26
      ])

    // Плюс: поддержим “00/01/25/26” как префиксы в sectionKey (если у тебя именно так)
    const excludedPrefixes = ['s00', 's01', 's25', 's26', '00_', '01_', '25_', '26_']

    const userExcluded = new Set(opts?.excludeSectionKeys ?? [])
    const isExcludedSectionKey = (k: string) => {
      if (defaultExcluded.has(k)) return true
      if (userExcluded.has(k)) return true
      return excludedPrefixes.some((p) => k.startsWith(p))
    }

    const out: Record<string, SectionRating> = {}

    for (const section of template.sections ?? []) {
      const sectionKey = section.key
      if (isExcludedSectionKey(sectionKey)) continue

      const acc: SectionRating = {
        sectionKey,
        score: 0,
        weight: 0,
        rating: null,
        answeredCount: 0,
        questionCount: 0,
        missingRequiredIds: [],
      }

      for (const q of section.questions ?? []) {
        // на всякий случай — если в вопросе sectionKey отличается от section.key
        if (isExcludedSectionKey(q.sectionKey)) continue

        // считаем только вопросы с options (radio/select)
        const options = q.options ?? []
        if (options.length === 0) continue

        acc.questionCount += 1

        const raw = answers?.[q.id]
        const selectedId =
          typeof raw === 'string'
            ? raw
            : Array.isArray(raw) && typeof raw[0] === 'string'
              ? raw[0]
              : null

        if (!selectedId) {
          if (q.validation?.required) acc.missingRequiredIds.push(q.id)
          continue
        }

        const opt = options.find((o) => o.id === selectedId)
        if (!opt) {
          // ответ есть, но не совпал с options — считаем как “нет ответа”
          if (q.validation?.required) acc.missingRequiredIds.push(q.id)
          continue
        }

        const pts = typeof opt.points === 'number' ? opt.points : 0
        const w = typeof opt.weight === 'number' ? opt.weight : 1

        acc.score += pts * w
        acc.weight += w
        acc.answeredCount += 1
      }

      acc.rating = acc.weight > 0 ? this.round3(acc.score / acc.weight) : null
      out[sectionKey] = acc
    }

    return { sectionRatings: out }
  }

  private static round3(x: number): number {
    return Math.round(x * 1000) / 1000
  }
}
