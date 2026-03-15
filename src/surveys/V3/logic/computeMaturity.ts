// ===== 3) src/surveys/v3/logic/computeMaturity.ts =====
import {
  ComputeInput,
  ComputeOutput,
  Level,
  SectionScoreDetail,
} from './types';
import { countSatisfied, isProcessFulfilled, kprocForLevel } from './helpers';

/**
 * ВАЛИДАТОР ОПЦИЙ ДЛЯ Да/Нет/НП:
 * - Проверяет все radio-вопросы, что их опции строго соответствуют формату:
 *   'yes' -> { points:1, weight:1 }
 *   'no'  -> { points:0, weight:1 }
 *   'na'  -> { points:1, weight:0 }
 * - Если вопрос помечен allowNonStandardYesNoNa=true, валидатор пропускает его (для кастомных шкал).
 * - Бросает ошибку при несоответствии. На проде можно заменить на console.warn.
 */
function validateYesNoNaOptions(input: ComputeInput): void {
  const expected = {
    yes: { points: 1, weight: 1 },
    no: { points: 0, weight: 1 },
    na: { points: 1, weight: 0 },
  } as const;

  for (const sectionKey of input.sections) {
    const section = input.sectionMap?.[sectionKey];
    if (!section) continue;

    for (const q of section.questions ?? []) {
      // Пропускаем не-radio и кастомные шкалы
      // @ts-expect-error — флаг допускаем как расширение описания вопроса
      if (q.answerType !== 'radio' || q.allowNonStandardYesNoNa === true) continue;

      const opts = Array.isArray(q.options) ? q.options : [];
      if (opts.length !== 3) {
        throw new Error(
          `Section "${sectionKey}", question "${q.id}": ожидается ровно 3 опции (yes/no/na), получено ${opts.length}`,
        );
      }

      const byId = new Map(opts.map((o: any) => [o.id, o]));
      for (const key of ['yes', 'no', 'na'] as const) {
        if (!byId.has(key)) {
          throw new Error(
            `Section "${sectionKey}", question "${q.id}": отсутствует опция "${key}"`,
          );
        }
        const { points, weight } = byId.get(key);
        const exp = expected[key];
        if (points !== exp.points || weight !== exp.weight) {
          throw new Error(
            `Section "${sectionKey}", question "${q.id}": неверные points/weight для "${key}". Ожидалось points=${exp.points}, weight=${exp.weight}, получено points=${points}, weight=${weight}`,
          );
        }
      }
    }
  }
}

function isSectionHygiene2Reached(
  answers: ComputeInput['answersBySection'][string] | undefined,
  process: ComputeInput['processBySection'][string] | undefined,
): boolean {
  if (!answers) return false;
  // Требуем: уровни 1 и 2 — доля 1.0 и процесс fulfilled
  for (const Lnum of [1, 2] as Level[]) {
    const arr = answers.levels[Lnum] ?? [];
    const { S, L } = countSatisfied(arr);
    const share = L > 0 ? S / L : 0;
    const p = process?.levels[Lnum];
    if (!(share === 1 && isProcessFulfilled(p))) {
      return false;
    }
  }
  return true;
}

export function computeCompanyMaturity(input: ComputeInput): ComputeOutput {
  // 0) Валидируем опции Да/Нет/НП для всех radio-вопросов секций
  // Примечание: в прод окружении можно заменить на try/catch + console.warn, чтобы не падать полностью.
  validateYesNoNaOptions(input);

  const hygieneMinLevel: Level = input.hygieneMinLevel ?? 2;

  // 1) Проверка достижения гигиенического минимума 2.0 для всех секций
  const hygieneFlags: Record<string, boolean> = {};
  for (const key of input.sections) {
    hygieneFlags[key] = isSectionHygiene2Reached(
      input.answersBySection[key],
      input.processBySection[key],
    );
  }
  const companyReachedHygiene2 = Object.values(hygieneFlags).every(Boolean);

  // 2) Подсчет по секциям с учетом Ограничения 4 (блокировка следующего уровня)
  const sectionScores: SectionScoreDetail[] = [];
  for (const key of input.sections) {
    const answers = input.answersBySection[key];
    const process = input.processBySection[key];
    const target = input.targetsBySection[key]?.targetLevel ?? 5;

    const U: Level = companyReachedHygiene2
      ? (target as Level)
      : (Math.min(hygieneMinLevel, target) as Level);

    let sum = 0;
    const levelShares: SectionScoreDetail['levelShares'] = {};

    // Для L=1 предыдущий считаем закрытым
    let prevLevelFullyClosed = true;

    for (let Lnum = 1; Lnum <= U; Lnum++) {
      const L = Lnum as Level;
      const arr = answers?.levels[L] ?? [];
      const { S, L: total } = countSatisfied(arr);
      const share = total > 0 ? S / total : 0;
      const pStatus = process?.levels[L];

      const blocked = !prevLevelFullyClosed;

      let appliedK = 1.0;
      if (!blocked) {
        appliedK = kprocForLevel(share, pStatus);
        sum += share * appliedK;
      }

      levelShares[L] = {
        L,
        share,
        blockedByPrev: blocked,
        appliedKproc: appliedK,
        processStatus: pStatus,
        questionsTotal: total,
        questionsSatisfied: S,
      };

      // Полностью закрыт = share==1 и процесс fulfilled
      prevLevelFullyClosed = share === 1 && isProcessFulfilled(pStatus);
    }

    sectionScores.push({
      sectionKey: key,
      targetLevel: target as Level,
      hygieneWindowU: U,
      levelShares,
      sum,
      hygiene2ReachedForSection: hygieneFlags[key],
    });
  }

  // 3) Итог — среднее по секциям (формула 2)
  const N = sectionScores.length || 1;
  const CS = sectionScores.reduce((acc, s) => acc + s.sum, 0) / N;

  return {
    sectionScores,
    CS,
    hygiene2Achieved: companyReachedHygiene2,
  };
}
