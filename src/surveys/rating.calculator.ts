// src/surveys/rating.calculator.ts
import type { SurveyQuestion } from './survey-questions'

export type Band = 'A' | 'B' | 'C' | 'D' | 'E'

export interface Recommendation {
  id: string
  categoryKey: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  actions: string[]
}

export class RatingCalculator {
  static calculate(
    answers: Record<string, any>,
    questions: SurveyQuestion[],
  ): {
    rating: number // 0..10
    band: Band
    score: number
    maxScore: number
    recommendations: Recommendation[]
  } {
    let totalScore = 0
    let maxScore = 0
    const recommendations: Recommendation[] = []

    for (const q of questions) {
      const opts = q.options ?? []
      if (opts.length === 0) continue

      const maxForQuestion = Math.max(...opts.map((o) => o.points ?? 0))
      maxScore += maxForQuestion

      const selectedOptionId = answers?.[q.id]
      if (!selectedOptionId) continue

      const opt = opts.find((o) => o.id === selectedOptionId)
      if (!opt) continue

      totalScore += opt.points ?? 0

      if (opt.weight > 0.7) {
        recommendations.push({
          id: `${q.id}.${opt.id}`,
          categoryKey: q.categoryKey,
          severity: this.getSeverity(opt.weight),
          title: q.text,
          description: `Вы выбрали: "${opt.label}". Это повышает риск.`,
          actions: [this.getDefaultAction(q.id)],
        })
      }
    }

    const ratio = maxScore === 0 ? 0 : totalScore / maxScore
    const rating = Math.round(ratio * 10 * 10) / 10 // 1 знак

    const band: Band =
      rating < 3 ? 'E' :
      rating < 5 ? 'D' :
      rating < 7 ? 'C' :
      rating < 8.5 ? 'B' : 'A'

    return { rating, band, score: totalScore, maxScore, recommendations }
  }

  private static getSeverity(weight: number): Recommendation['severity'] {
    if (weight >= 0.9) return 'CRITICAL'
    if (weight > 0.7) return 'HIGH'
    if (weight >= 0.4) return 'MEDIUM'
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
