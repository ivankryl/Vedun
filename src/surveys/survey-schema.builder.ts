// src/surveys/survey-schema.builder.ts
import { SURVEY_TEMPLATE_V1 } from './v1'
import type { Section, Question } from './v1/types'

function mapQuestion(q: Question) {
  return {
    id: q.id,
    sectionKey: q.sectionKey,
    categoryKey: q.categoryKey,
    text: q.text,
    helpText: q.helpText,

    type: q.answerType,

    // в новой модели required лежит в validation
    required: q.validation?.required ?? false,
    validation: q.validation ?? undefined,

    // важно для скоринга/калькулятора
    isRisk: q.isRisk ?? false,

    // options есть только у select/radio/multi_select
    options:
      'options' in q
        ? (q.options ?? []).map((o) => ({
            id: o.id,
            label: o.label,
            points: o.points,
            weight: o.weight,
          }))
        : undefined,

    // доп. поля для UI (если есть)
    placeholder: (q as any).placeholder,
    unit: (q as any).unit,
    labels: (q as any).labels,
    scoringMode: (q as any).scoringMode,
  }
}

function mapSection(s: Section) {
  return {
    id: s.key,
    key: s.key,
    title: s.title,
    description: s.description,
    order: s.order,
    questions: s.questions.map(mapQuestion),
  }
}

export function buildSurveySchemaV1() {
  return {
    version: SURVEY_TEMPLATE_V1.version,
    title: SURVEY_TEMPLATE_V1.title,
    sections: SURVEY_TEMPLATE_V1.sections
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(mapSection),
  }
}
