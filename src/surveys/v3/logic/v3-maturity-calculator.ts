// src/surveys/v3/logic/v3-maturity-calculator.ts

/**
 * Калькулятор уровней зрелости для модели опроса v3
 *
 * Логика:
 * 1. Вопросы в каждой секции отсортированы по уровням (l1, l2, l3, l4, l5)
 * 2. Каждый вопрос имеет вес = 1 / количество_вопросов_на_этом_уровне
 * 3. Ответ "да" или "неприменимо" = получить полный вес
 * 4. Ответ "нет" = получить 0 веса
 * 5. Если есть хотя бы один "нет" на уровне = stop, не считаем уровни выше
 * 6. Финальный скор = 0-5 (дробный, округлено до 0.1)
 */

export interface MaturityQuestion {
  id: string;
  level: number;           // 1, 2, 3, 4, 5
  categoryKey: string;     // 'org_structure.l1', 'org_structure.l2' и т.д.
  text: string;
  answerType: 'radio' | 'select';
  options: Array<{
    id: string;
    label: string;
  }>;
}

export interface MaturitySection {
  sectionKey: string;      // 's01', 's02', ..., 's16'
  title: string;
  description?: string;
  questions: MaturityQuestion[];
}

export interface MaturityTemplate {
  version: string;
  title: string;
  sections: MaturitySection[];
}

export type AnswerValue = 'да' | 'нет' | 'неприменимо' | string;

export interface MaturityCalculatorInput {
  answers: Record<string, AnswerValue>;        // questionId -> answer
  template: MaturityTemplate;
  surveyType?: 'SMALL' | 'MEDIUM' | 'LARGE';
}

export interface SectionLevelDetail {
  level: number;
  totalQuestions: number;
  satisfiedQuestions: number;
  questionWeight: number;
  levelScore: number;
  hasNonApplicable: boolean;
  nonApplicableQuestions: string[];
}

export interface SectionScoreDetail {
  sectionKey: string;
  sectionTitle: string;
  finalScore: number;                          // 0-5, rounded to 0.1
  maxLevelReached: number;                     // 1, 2, 3, 4, или 5
  levelDetails: Record<number, SectionLevelDetail>;
  hasNonApplicable: boolean;
  nonApplicableQuestions: string[];
}

export interface MaturityCalculatorOutput {
  scoresForRadar: Record<string, number>;      // 's01' -> 2.5, 's02' -> 1.75, ...
  sectionScores: SectionScoreDetail[];         // Детальная информация по каждой секции
  applicableNotes: Record<string, {
    hasNonApplicable: boolean;
    level?: number;
    questionsToReview: string[];
  }>;
  timestamp: Date;
}

/**
 * Основная функция расчета
 */
export function calculateMaturityLevels(
  input: MaturityCalculatorInput,
): MaturityCalculatorOutput {
  const scoresForRadar: Record<string, number> = {};
  const sectionScores: SectionScoreDetail[] = [];
  const applicableNotes: Record<string, any> = {};

  // Пройти по каждой секции
  for (const section of input.template.sections) {
    const sectionKey = section.sectionKey;

    // Считаем результаты для этой секции
    const sectionResult = calculateSectionScore(
      section,
      input.answers,
    );

    sectionScores.push(sectionResult);
    scoresForRadar[sectionKey] = sectionResult.finalScore;

    // Если есть неприменимо вопросы, отметим
    if (sectionResult.hasNonApplicable) {
      applicableNotes[sectionKey] = {
        hasNonApplicable: true,
        level: sectionResult.maxLevelReached,
        questionsToReview: sectionResult.nonApplicableQuestions,
      };
    }
  }

  return {
    scoresForRadar,
    sectionScores,
    applicableNotes,
    timestamp: new Date(),
  };
}

/**
 * Расчет скора для одной секции
 */
function calculateSectionScore(
  section: MaturitySection,
  answers: Record<string, AnswerValue>,
): SectionScoreDetail {
  let finalScore = 0;
  let maxLevelReached = 0;
  const levelDetails: Record<number, SectionLevelDetail> = {};
  const allNonApplicableQuestions: string[] = [];
  let hasNonApplicableFlag = false;

  // Группируем вопросы по уровням
  const questionsByLevel = groupQuestionsByLevel(section.questions);

  // Проходим по уровням в порядке возрастания
  for (let level = 1; level <= 5; level++) {
    const levelQuestions = questionsByLevel[level];

    // Если нет вопросов на этом уровне, stop
    if (!levelQuestions || levelQuestions.length === 0) {
      break;
    }

    const questionsCount = levelQuestions.length;
    const questionWeight = 1.0 / questionsCount;

    let satisfiedCount = 0;
    const levelNonApplicable: string[] = [];

    // Проходим по каждому вопросу этого уровня
    for (const question of levelQuestions) {
      const answer = answers[question.id] || '';

      if (answer === 'да' || answer === 'неприменимо') {
        satisfiedCount++;
        
        if (answer === 'неприменимо') {
          levelNonApplicable.push(question.id);
          hasNonApplicableFlag = true;
        }
      }
      // Если 'нет', то не считаем (satisfiedCount не увеличиваем)
    }

    // Считаем скор этого уровня
    const levelScore = satisfiedCount * questionWeight;
    finalScore += levelScore;
    maxLevelReached = level;

    levelDetails[level] = {
      level,
      totalQuestions: questionsCount,
      satisfiedQuestions: satisfiedCount,
      questionWeight,
      levelScore,
      hasNonApplicable: levelNonApplicable.length > 0,
      nonApplicableQuestions: levelNonApplicable,
    };

    allNonApplicableQuestions.push(...levelNonApplicable);

    // Если не все вопросы "да"/"неприменимо", то stop
    if (satisfiedCount < questionsCount) {
      break;
    }
  }

  // Округлить до 0.1
  finalScore = Math.round(finalScore * 10) / 10;

  return {
    sectionKey: section.sectionKey,
    sectionTitle: section.title,
    finalScore,
    maxLevelReached,
    levelDetails,
    hasNonApplicable: hasNonApplicableFlag,
    nonApplicableQuestions: allNonApplicableQuestions,
  };
}

/**
 * Группировка вопросов по уровням
 */
function groupQuestionsByLevel(
  questions: MaturityQuestion[],
): Record<number, MaturityQuestion[]> {
  const grouped: Record<number, MaturityQuestion[]> = {};

  for (const question of questions) {
    const level = question.level;

    if (!grouped[level]) {
      grouped[level] = [];
    }

    grouped[level].push(question);
  }

  return grouped;
}

/**
 * Вспомогательная функция для трансформации результатов
 */
export function formatMaturityForDatabase(output: MaturityCalculatorOutput): {
  scoresForRadar: Record<string, number>;
  sectionScores: Record<string, any>;
  applicableNotes: string;
  calculatedAt: Date;
} {
  const sectionScoresMap: Record<string, any> = {};

  for (const section of output.sectionScores) {
    sectionScoresMap[section.sectionKey] = {
      finalScore: section.finalScore,
      maxLevelReached: section.maxLevelReached,
      hasNonApplicable: section.hasNonApplicable,
    };
  }

  return {
    scoresForRadar: output.scoresForRadar,
    sectionScores: sectionScoresMap,
    applicableNotes: JSON.stringify(output.applicableNotes),
    calculatedAt: output.timestamp,
  };
}

/**
 * Вспомогательная функция для валидации
 */
export function validateInputs(input: MaturityCalculatorInput): string[] {
  const errors: string[] = [];

  if (!input.template) {
    errors.push('Template is required');
  }

  if (!input.answers || typeof input.answers !== 'object') {
    errors.push('Answers must be an object');
  }

  if (!input.template.sections || input.template.sections.length === 0) {
    errors.push('Template must have at least one section');
  }

  return errors;
}
