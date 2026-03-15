// ===== 3) src/surveys/v3/logic/computeMaturity.ts =====
import {
  ComputeInput,
  ComputeOutput,
  Level,
  SectionScoreDetail,
} from './types';
import { countSatisfied, isProcessFulfilled, kprocForLevel } from './helpers';

type YesNoNaId = 'yes' | 'no' | 'na';
type YesNoNaOption = { id: YesNoNaId; points: 0 | 1; weight: 0 | 1 };

/**
 * Мягкий валидатор опций Да/Нет/НП:
 * - Работает только если в input (необязательно по типу) передан sectionMap с вопросами.
 * - Проверяет, что radio-вопросы имеют строго три опции (yes/no/na) с ожидаемыми points/weight,
 *   кроме случаев, когда у вопроса стоит флаг allowNonStandardYesNoNa === true.
 * - Если sectionMap отсутствует — валидацию пропускаем.
 */
function validateYesNoNaOptions(input: ComputeInput): void {
  // Допускаем необязательное наличие sectionMap в рантайме
  const sectionMap = (input as any)?.sectionMap as
    | Record<string, { questions?: Array<{ id: string; answerType?: string; allowNonStandardYesNoNa?: boolean; options?: YesNoNaOption[] }> }>
    | undefined;

  if (!sectionMap) return; // нет схемы — пропускаем валидацию

  const expected = {
    yes: { points: 1 as const, weight: 1 as const },
    no: { points: 0 as const, weight: 1 as const },
    na: { points: 1 as const, weight: 0 as const },
  };

  for (const sectionKey of input.sections) {
    const section = sectionMap[sectionKey];
    if (!section) continue;

    for (const q of section.questions ?? []) {
      if (q.answerType !== 'radio' || q.allowNonStandardYesNoNa === true) continue;

      const opts = Array.isArray(q.options) ? (q.options as YesNoNaOption[]) : [];
      if (opts.length !== 3) {
        throw new Error(
          `Section "${sectionKey}", question "${q.id}": ожидается ровно 3 опции (yes/no/na), получено ${opts.length}`,
        );
      }

      const byId = new Map<YesNoNaId, YesNoNaOption>(opts.map((o) => [o.id, o]));
      (['yes', 'no', 'na'] as const).forEach((key) => {
        const opt = byId.get(key);
        if (!opt) {
          throw new Error(
            `Section "${sectionKey}", question "${q.id}": отсутствует опция "${key}"`,
          );
        }
        const exp = expected[key];
        if (opt.points !== exp.points || opt.weight !== exp.weight) {
          throw new Error(
            `Section "${sectionKey}", question "${q.id}": неверные points/weight для "${key}". Ожидалось points=${exp.points}, weight=${exp.weight}, получено points=${opt.points}, weight=${opt.weight}`,
          );
        }
      });
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
  // 0) Валидируем опции Да/Нет/НП (если есть sectionMap)
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

  // 2) Подсчет по секциям с учетом ограничения (блокировка следующего уровня)
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

  // 3) Итог — среднее по секциям
  const N = sectionScores.length || 1;
  const CS = sectionScores.reduce((acc, s) => acc + s.sum, 0) / N;

  return {
    sectionScores,
    CS,
    hygiene2Achieved: companyReachedHygiene2,
  };
}
