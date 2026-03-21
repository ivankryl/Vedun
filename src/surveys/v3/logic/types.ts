// ===== 1) src/surveys/v3/logic/types.ts =====
export type AnswerId = 'yes' | 'no' | 'na';

export interface QuestionAnswer {
  id: string;
  answer: AnswerId;
  weight: number; // 1 — учитываем, 0 — НП (не влияет)
}

export type Level = 1 | 2 | 3 | 4 | 5;

export type ProcessStatus = 'fulfilled' | 'partial' | 'not_fulfilled';

export interface SectionAnswers {
  sectionKey: string;
  levels: {
    [L in Level]?: QuestionAnswer[];
  };
}

export interface SectionProcessMaturity {
  sectionKey: string;
  levels: {
    [L in Level]?: ProcessStatus;
  };
}

export interface SectionTarget {
  sectionKey: string;
  targetLevel: Level; // ЦУЗ по секции
}

export interface ComputeInput {
  sections: string[]; // ключи секций, порядок важен для вывода
  answersBySection: Record<string, SectionAnswers>;
  processBySection: Record<string, SectionProcessMaturity>;
  targetsBySection: Record<string, SectionTarget>;
  hygieneMinLevel?: Level; // по умолчанию 2
}

export interface LevelShareDetail {
  L: Level;
  share: number; // S/L
  blockedByPrev: boolean;
  appliedKproc: number; // 1.0 или 0.9
  processStatus?: ProcessStatus;
  questionsTotal: number;
  questionsSatisfied: number;
}

export interface SectionScoreDetail {
  sectionKey: string;
  targetLevel: Level;
  hygieneWindowU: Level; // фактически используемый U (min(2, ЦУЗ), если гигиена не достигнута)
  levelShares: {
    [L in Level]?: LevelShareDetail;
  };
  sum: number; // CS_i
  hygiene2ReachedForSection: boolean;
}

export interface ComputeOutput {
  sectionScores: SectionScoreDetail[];
  CS: number; // итоговый уровень зрелости КБ (среднее по направлениям)
  hygiene2Achieved: boolean; // флаг гигиенического минимума 2.0
}
