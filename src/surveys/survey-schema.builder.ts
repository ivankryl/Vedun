// src/surveys/survey-schema.builder.ts
import { SURVEY_QUESTIONS } from './survey-questions'

export function buildSurveySchemaV1() {
  const byGroup = new Map<string, any[]>()

  for (const q of SURVEY_QUESTIONS) {
    const arr = byGroup.get(q.group) ?? []
    arr.push({
      id: q.id,
      text: q.text,
      type: q.type,
      required: q.required,
      categoryKey: q.categoryKey,
      options: (q.options ?? []).map((o) => ({
        id: o.id,         // важно: именно id
        label: o.label,
        points: o.points, // нужно калькулятору
        weight: o.weight, // нужно рекомендациям
        score: o.score,   // опционально, но полезно
      })),
    })
    byGroup.set(q.group, arr)
  }

  return {
    version: 'v1',
    sections: Array.from(byGroup.entries()).map(([title, questions]) => ({
      id: title,
      title,
      questions,
    })),
  }
}
