// ===== 2) src/surveys/v3/logic/helpers.ts =====
import { QuestionAnswer, ProcessStatus } from './types';

export function countSatisfied(answers: QuestionAnswer[] = []): { S: number; L: number } {
  const L = answers.length;
  let S = 0;
  for (const a of answers) {
    if (a.answer === 'yes') S += 1;
    else if (a.answer === 'na' && a.weight === 0) S += 1;
  }
  return { S, L };
}

export function isProcessFulfilled(status: ProcessStatus | undefined): boolean {
  return status === 'fulfilled';
}

export function kprocForLevel(share: number, status: ProcessStatus | undefined): number {
  // Штраф 10% применяется только если на уровне все вопросы закрыты (share==1), но процессные требования не полностью
  if (share === 1 && status && !isProcessFulfilled(status)) {
    return 0.9;
  }
  return 1.0;
}
