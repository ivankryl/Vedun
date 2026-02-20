// src/surveys/survey-questions.ts
import { SURVEY_TEMPLATE_V1 } from './v1'
import type { Question } from './v1/types'

// временно: пока остальной код ожидает "questions: SurveyQuestion[]"
export type SurveyQuestion = Question

export const SURVEY_QUESTIONS_V1: SurveyQuestion[] =
  SURVEY_TEMPLATE_V1.sections.flatMap((s) => s.questions)

// удобный хелпер
export function getSurveyQuestionsV1(): SurveyQuestion[] {
  return SURVEY_QUESTIONS_V1
}
