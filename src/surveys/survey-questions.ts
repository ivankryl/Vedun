// src/surveys/survey-questions.ts
import { SURVEY_TEMPLATE_V2 } from './v2'
import type { Question } from './v2/types'

// временно: пока остальной код ожидает "questions: SurveyQuestion[]"
export type SurveyQuestion = Question

export const SURVEY_QUESTIONS_V2: SurveyQuestion[] =
  SURVEY_TEMPLATE_V2.sections.flatMap((s) => s.questions)

// удобный хелпер
export function getSurveyQuestionsV1(): SurveyQuestion[] {
  return SURVEY_QUESTIONS_V2
}
