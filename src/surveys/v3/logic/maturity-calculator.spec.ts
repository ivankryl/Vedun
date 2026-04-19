// src/surveys/v3/logic/maturity-calculator.spec.ts

import { calculateMaturityLevels, MaturityTemplate, MaturityCalculatorInput } from './maturity-calculator';

describe('MaturityCalculator', () => {
  let mockTemplate: MaturityTemplate;

  beforeEach(() => {
    // Создаем шаблон с одной секцией для тестирования
    mockTemplate = {
      version: 'v3',
      title: 'Test Template',
      sections: [
        {
          sectionKey: 's01',
          title: 'Organizational Structure',
          questions: [
            // Уровень 1: 2 вопроса
            {
              id: 's01.org.l1.q1',
              level: 1,
              categoryKey: 'org_structure.l1',
              text: 'Q1 Level 1',
              answerType: 'radio',
              options: [
                { id: 'yes', label: 'Да' },
                { id: 'no', label: 'Нет' },
                { id: 'na', label: 'Неприменимо' },
              ],
            },
            {
              id: 's01.org.l1.q2',
              level: 1,
              categoryKey: 'org_structure.l1',
              text: 'Q2 Level 1',
              answerType: 'radio',
              options: [
                { id: 'yes', label: 'Да' },
                { id: 'no', label: 'Нет' },
                { id: 'na', label: 'Неприменимо' },
              ],
            },
            // Уровень 2: 3 вопроса
            {
              id: 's01.org.l2.q1',
              level: 2,
              categoryKey: 'org_structure.l2',
              text: 'Q1 Level 2',
              answerType: 'radio',
              options: [
                { id: 'yes', label: 'Да' },
                { id: 'no', label: 'Нет' },
                { id: 'na', label: 'Неприменимо' },
              ],
            },
            {
              id: 's01.org.l2.q2',
              level: 2,
              categoryKey: 'org_structure.l2',
              text: 'Q2 Level 2',
              answerType: 'radio',
              options: [
                { id: 'yes', label: 'Да' },
                { id: 'no', label: 'Нет' },
                { id: 'na', label: 'Неприменимо' },
              ],
            },
            {
              id: 's01.org.l2.q3',
              level: 2,
              categoryKey: 'org_structure.l2',
              text: 'Q3 Level 2',
              answerType: 'radio',
              options: [
                { id: 'yes', label: 'Да' },
                { id: 'no', label: 'Нет' },
                { id: 'na', label: 'Неприменимо' },
              ],
            },
            // Уровень 3: 2 вопроса
            {
              id: 's01.org.l3.q1',
              level: 3,
              categoryKey: 'org_structure.l3',
              text: 'Q1 Level 3',
              answerType: 'radio',
              options: [
                { id: 'yes', label: 'Да' },
                { id: 'no', label: 'Нет' },
                { id: 'na', label: 'Неприменимо' },
              ],
            },
            {
              id: 's01.org.l3.q2',
              level: 3,
              categoryKey: 'org_structure.l3',
              text: 'Q2 Level 3',
              answerType: 'radio',
              options: [
                { id: 'yes', label: 'Да' },
                { id: 'no', label: 'Нет' },
                { id: 'na', label: 'Неприменимо' },
              ],
            },
          ],
        },
      ],
    };
  });

  describe('Perfect Score - All Yes', () => {
    it('should calculate maximum score (3.0) when all answers are yes', () => {
      const input: MaturityCalculatorInput = {
        answers: {
          's01.org.l1.q1': 'да',
          's01.org.l1.q2': 'да',
          's01.org.l2.q1': 'да',
          's01.org.l2.q2': 'да',
          's01.org.l2.q3': 'да',
          's01.org.l3.q1': 'да',
          's01.org.l3.q2': 'да',
        },
        template: mockTemplate,
      };

      const result = calculateMaturityLevels(input);

      expect(result.scoresForRadar['s01']).toBe(3.0);
      expect(result.sectionScores[0].maxLevelReached).toBe(3);
      expect(result.sectionScores[0].hasNonApplicable).toBe(false);
    });
  });

  describe('Partial Score - Mixed Answers', () => {
    it('should stop at first level with "no" answer', () => {
      const input: MaturityCalculatorInput = {
        answers: {
          's01.org.l1.q1': 'да',
          's01.org.l1.q2': 'да',       // Уровень 1 complete
          's01.org.l2.q1': 'да',       // Начало уровня 2
          's01.org.l2.q2': 'нет',      // ❌ STOP HERE
          's01.org.l2.q3': 'да',
          's01.org.l3.q1': 'да',
          's01.org.l3.q2': 'да',
        },
        template: mockTemplate,
      };

      const result = calculateMaturityLevels(input);

      // Level 1: 2/2 = 1.0
      // Level 2: 2/3 * weight(1/3) = 2 * 0.333 = 0.666
      expect(result.scoresForRadar['s01']).toBe(1.7); // 1.0 + 0.666 ≈ 1.7
      expect(result.sectionScores[0].maxLevelReached).toBe(2);
    });

    it('should calculate fractional scores correctly', () => {
      const input: MaturityCalculatorInput = {
        answers: {
          's01.org.l1.q1': 'да',
          's01.org.l1.q2': 'да',       // Level 1: 2/2 = 1.0
          's01.org.l2.q1': 'да',       // Level 2: 2/3 = 0.666
          's01.org.l2.q2': 'нет',
          's01.org.l2.q3': 'да',
        },
        template: mockTemplate,
      };

      const result = calculateMaturityLevels(input);

      // 1.0 + 0.666 = 1.666 ≈ 1.7 (rounded to 0.1)
      expect(result.scoresForRadar['s01']).toBeCloseTo(1.7, 1);
    });
  });

  describe('Non-Applicable Answers', () => {
    it('should treat "неприменимо" as "да" in calculations', () => {
      const input: MaturityCalculatorInput = {
        answers: {
          's01.org.l1.q1': 'да',
          's01.org.l1.q2': 'неприменимо',  // Treated as 'да'
          's01.org.l2.q1': 'да',
          's01.org.l2.q2': 'да',
          's01.org.l2.q3': 'да',
          's01.org.l3.q1': 'да',
          's01.org.l3.q2': 'да',
        },
        template: mockTemplate,
      };

      const result = calculateMaturityLevels(input);

      expect(result.scoresForRadar['s01']).toBe(3.0); // All levels complete
      expect(result.sectionScores[0].hasNonApplicable).toBe(true);
    });

    it('should mark section as having non-applicable notes', () => {
      const input: MaturityCalculatorInput = {
        answers: {
          's01.org.l1.q1': 'да',
          's01.org.l1.q2': 'неприменимо',
          's01.org.l2.q1': 'да',
          's01.org.l2.q2': 'да',
          's01.org.l2.q3': 'да',
        },
        template: mockTemplate,
      };

      const result = calculateMaturityLevels(input);

      expect(result.applicableNotes['s01']).toBeDefined();
      expect(result.applicableNotes['s01'].hasNonApplicable).toBe(true);
      expect(result.applicableNotes['s01'].questionsToReview).toContain('s01.org.l1.q2');
    });
  });

  describe('Minimum Score - All No', () => {
    it('should calculate minimum score (0.5) when first level has "no"', () => {
      const input: MaturityCalculatorInput = {
        answers: {
          's01.org.l1.q1': 'нет',
          's01.org.l1.q2': 'да',       // 1/2 = 0.5
          's01.org.l2.q1': 'да',
          's01.org.l2.q2': 'да',
          's01.org.l2.q3': 'да',
        },
        template: mockTemplate,
      };

      const result = calculateMaturityLevels(input);

      expect(result.scoresForRadar['s01']).toBe(0.5);
      expect(result.sectionScores[0].maxLevelReached).toBe(1);
    });

    it('should calculate zero score when all answers are no', () => {
      const input: MaturityCalculatorInput = {
        answers: {
          's01.org.l1.q1': 'нет',
          's01.org.l1.q2': 'нет',      // 0/2 = 0.0
          's01.org.l2.q1': 'да',
          's01.org.l2.q2': 'да',
          's01.org.l2.q3': 'да',
        },
        template: mockTemplate,
      };

      const result = calculateMaturityLevels(input);

      expect(result.scoresForRadar['s01']).toBe(0.0);
      expect(result.sectionScores[0].maxLevelReached).toBe(0);
    });
  });

  describe('Weight Calculations', () => {
    it('should calculate correct weights for different question counts', () => {
      // Level 1: 2 вопроса, weight = 0.5 каждый
      // Level 2: 3 вопроса, weight = 0.333 каждый
      // Level 3: 2 вопроса, weight = 0.5 каждый
      const input: MaturityCalculatorInput = {
        answers: {
          's01.org.l1.q1': 'да',
          's01.org.l1.q2': 'да',       // 1.0 (0.5 + 0.5)
          's01.org.l2.q1': 'да',
          's01.org.l2.q2': 'да',
          's01.org.l2.q3': 'да',       // 1.0 (0.333 * 3)
          's01.org.l3.q1': 'да',
          's01.org.l3.q2': 'да',       // 1.0 (0.5 + 0.5)
        },
        template: mockTemplate,
      };

      const result = calculateMaturityLevels(input);
      const section = result.sectionScores[0];

      expect(section.levelDetails[1].questionWeight).toBe(0.5);
      expect(section.levelDetails[2].questionWeight).toBeCloseTo(0.333, 2);
      expect(section.levelDetails[3].questionWeight).toBe(0.5);
    });
  });

  describe('Rounding', () => {
    it('should round to 0.1 decimal place', () => {
      const input: MaturityCalculatorInput = {
        answers: {
          's01.org.l1.q1': 'да',
          's01.org.l1.q2': 'да',       // 1.0
          's01.org.l2.q1': 'да',
          's01.org.l2.q2': 'нет',
          's01.org.l2.q3': 'да',       // 0.666 ≈ 0.7
        },
        template: mockTemplate,
      };

      const result = calculateMaturityLevels(input);

      // 1.0 + 0.666 = 1.666 → 1.7
      expect(result.scoresForRadar['s01']).toBe(1.7);
    });

    it('should round up correctly', () => {
      const input: MaturityCalculatorInput = {
        answers: {
          's01.org.l1.q1': 'да',
          's01.org.l1.q2': 'да',       // 1.0
          's01.org.l2.q1': 'да',
          's01.org.l2.q2': 'да',
          's01.org.l2.q3': 'нет',      // 0.666 → 0.7
        },
        template: mockTemplate,
      };

      const result = calculateMaturityLevels(input);

      // 1.0 + 0.666 = 1.666 → 1.7
      expect(result.scoresForRadar['s01']).toBe(1.7);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing answers gracefully', () => {
      const input: MaturityCalculatorInput = {
        answers: {
          's01.org.l1.q1': 'да',
          // 's01.org.l1.q2' is missing (treat as 'нет')
          's01.org.l2.q1': 'да',
        },
        template: mockTemplate,
      };

      const result = calculateMaturityLevels(input);

      // Level 1: q1='да', q2=missing='нет' → 1/2 = 0.5
      expect(result.scoresForRadar['s01']).toBe(0.5);
    });

    it('should handle empty answers object', () => {
      const input: MaturityCalculatorInput = {
        answers: {},
        template: mockTemplate,
      };

      const result = calculateMaturityLevels(input);

      // All questions unanswered = treated as 'нет'
      expect(result.scoresForRadar['s01']).toBe(0.0);
    });
  });

  describe('Range Validation', () => {
    it('should always return scores between 0 and 5', () => {
      // Test various inputs
      const testCases = [
        { 's01.org.l1.q1': 'да', 's01.org.l1.q2': 'да' }, // 1.0
        { 's01.org.l1.q1': 'нет', 's01.org.l1.q2': 'нет' }, // 0.0
        { 's01.org.l1.q1': 'да', 's01.org.l1.q2': 'нет' }, // 0.5
      ];

      for (const answers of testCases) {
        const input: MaturityCalculatorInput = { answers, template: mockTemplate };
        const result = calculateMaturityLevels(input);
        const score = result.scoresForRadar['s01'];

        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('Multiple Sections', () => {
    it('should calculate scores for all 16 sections', () => {
      // Create a template with 16 sections
      const multiSectionTemplate: MaturityTemplate = {
        ...mockTemplate,
        sections: Array.from({ length: 16 }, (_, i) => ({
          ...mockTemplate.sections[0],
          sectionKey: `s${String(i + 1).padStart(2, '0')}`,
          title: `Section ${i + 1}`,
        })),
      };

      const answers: Record<string, string> = {};
      for (let i = 0; i < 16; i++) {
        const section = `s${String(i + 1).padStart(2, '0')}`;
        answers[`${section}.org.l1.q1`] = 'да';
        answers[`${section}.org.l1.q2`] = 'да';
        answers[`${section}.org.l2.q1`] = 'да';
        answers[`${section}.org.l2.q2`] = 'да';
        answers[`${section}.org.l2.q3`] = 'да';
      }

      const input: MaturityCalculatorInput = { answers, template: multiSectionTemplate };
      const result = calculateMaturityLevels(input);

      expect(Object.keys(result.scoresForRadar).length).toBe(16);
      for (let i = 0; i < 16; i++) {
        const key = `s${String(i + 1).padStart(2, '0')}`;
        expect(result.scoresForRadar[key]).toBeDefined();
      }
    });
  });
});
