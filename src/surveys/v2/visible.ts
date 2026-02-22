// src/surveys/v1/visible.ts
import type { Condition } from './types'

type Answers = Record<string, unknown>

export function isVisible(answers: Answers, visibleIf?: Condition): boolean {
  if (!visibleIf) return true

  if ('any' in visibleIf) return visibleIf.any.some((c) => isVisible(answers, c))
  if ('all' in visibleIf) return visibleIf.all.every((c) => isVisible(answers, c))

  const actual = answers[visibleIf.questionId]

  switch (visibleIf.op) {
    case 'exists':
      return actual !== undefined && actual !== null && actual !== ''
    case 'not_exists':
      return actual === undefined || actual === null || actual === ''

    case 'equals':
      return actual === visibleIf.value
    case 'not_equals':
      return actual !== visibleIf.value

    case 'in': {
      const arr = Array.isArray(visibleIf.value) ? visibleIf.value : []
      return arr.includes(actual as any)
    }

    case 'not_in': {
      const arr = Array.isArray(visibleIf.value) ? visibleIf.value : []
      return !arr.includes(actual as any)
    }
  }
}
