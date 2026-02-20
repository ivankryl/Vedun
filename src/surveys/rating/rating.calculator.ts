// src/surveys/rating/rating.calculator.ts
import type { SurveyQuestion } from './survey-questions'

export type Band = 'A' | 'B' | 'C' | 'D' | 'E'

export interface Recommendation {
  id: string
  sectionKey: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  actions: string[]
}

export interface SectionScore {
  sectionKey: string
  score: number
  maxScore: number
  rating: number // 0..10
}

export class RatingCalculator {
  static calculate(
    answers: Record<string, any>,
    questions: SurveyQuestion[],
    opts?: {
      excludeSectionKeys?: string['general'] // например ['general']
      // если у вас часть вопросов "не риск" — можно помечать флагом
      // и/или не задавать points у options
    },
  ): {
    rating: number // 0..10
    band: Band
    score: number
    maxScore: number
    sectionScores: Record<string, SectionScore>
    recommendations: Recommendation[]
  } {
    const exclude = new Set(opts?.excludeSectionKeys ?? [])

    let totalScore = 0
    let totalMaxScore = 0

    const sectionAcc = new Map<string, { score: number; max: number }>()
    const recommendations: Recommendation[] = []

    for (const q of questions) {
      const sectionKey = (q as any).sectionKey ?? q.categoryKey ?? 'unknown'
      if (exclude.has(sectionKey)) continue

      const optsArr = q.options ?? []
      if (optsArr.length === 0) continue

      // считаем только риск-вопросы:
      // правило: вопрос "риск" если есть хотя бы один points (или явный флаг q.isRisk === true)
      const hasPoints = optsArr.some((o) => typeof o.points === 'number')
      const isRisk = (q as any).isRisk === true || hasPoints
      if (!isRisk) continue

      const maxForQuestion = Math.max(...optsArr.map((o) => o.points ?? 0))
      if (!Number.isFinite(maxForQuestion) || maxForQuestion <= 0) continue

      totalMaxScore += maxForQuestion
      const acc = sectionAcc.get(sectionKey) ?? { score: 0, max: 0 }
      acc.max += maxForQuestion

      const selected = answers?.[q.id]
      // поддержим варианты: radio -> optionId, multi -> optionId[]
      const selectedIds: string[] = Array.isArray(selected)
        ? selected
        : (typeof selected === 'string' ? [selected] : [])

      if (selectedIds.length > 0) {
        // для radio/select берём первый
        const opt = optsArr.find((o) => o.id === selectedIds[0])
        if (opt) {
          const pts = opt.points ?? 0
          totalScore += pts
          acc.score += pts

          // рекомендации: если выбрали вариант сильно хуже максимума
          const ratio = maxForQuestion === 0 ? 0 : pts / maxForQuestion
          if (ratio < 0.6) {
            recommendations.push({
              id: `${q.id}.${opt.id}`,
              sectionKey,
              severity: this.getSeverityByRatio(ratio),
              title: q.text,
              description: `Вы выбрали: "${opt.label}". Балл: ${pts}/${maxForQuestion}.`,
              actions: [this.getDefaultAction(q.id)],
            })
          }
        }
      }

      sectionAcc.set(sectionKey, acc)
    }

    const rating = this.toRating(totalScore, totalMaxScore)
    const band: Band =
      rating < 3 ? 'E' :
      rating < 5 ? 'D' :
      rating < 7 ? 'C' :
      rating < 8.5 ? 'B' : 'A'

    const sectionScores: Record<string, SectionScore> = {}
    for (const [sectionKey, v] of sectionAcc.entries()) {
      sectionScores[sectionKey] = {
        sectionKey,
        score: v.score,
        maxScore: v.max,
        rating: this.toRating(v.score, v.max),
      }
    }

    return {
      rating,
      band,
      score: totalScore,
      maxScore: totalMaxScore,
      sectionScores,
      recommendations,
    }
  }

  private static toRating(score: number, max: number): number {
    const ratio = max === 0 ? 0 : score / max
    return Math.round(ratio * 10 * 10) / 10 // 1 знак
  }

  private static getSeverityByRatio(ratio: number): Recommendation['severity'] {
    // ratio: 1 хорошо, 0 плохо
    if (ratio <= 0.1) return 'CRITICAL'
    if (ratio < 0.3) return 'HIGH'
    if (ratio < 0.6) return 'MEDIUM'
    return 'LOW'
  }

  private static getDefaultAction(questionId: string): string {
    const map: Record<string, string> = {
      'testing.bug_bounty': 'Запустить/расширить Bug Bounty программу и определить scope.',
      'testing.pentest_frequency': 'Настроить регулярный pentest и процесс устранения уязвимостей.',
      'testing.vuln_scanning': 'Внедрить регулярное сканирование уязвимостей и контроль исправлений.',
      'testing.phishing_drills': 'Проводить регулярные фишинг-тренировки и обучение сотрудников.',
    }
    return map[questionId] ?? 'Сформировать план улучшения по данному контролю и назначить ответственного.'
  }
}
