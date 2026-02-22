// src/surveys/v1/sections/09_effective_cybersecurity.ts
import type { Section } from '../types'

const YES_NO = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
] as const

export const SECTION_09_EFFECTIVE_CYBERSECURITY: Section = {
  key: 'effective_cybersecurity',
  title: 'Результативная кибербезопасность',
  order: 10,
  questions: [
    {
      id: 's09.01.cyber_trials_participant',
      sectionKey: 'effective_cybersecurity',
      categoryKey: 'security.effectiveness',
      text: 'Являетесь ли вы участником Кибериспытаний?',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO],
    },
    {
      id: 's09.02.cyber_trials_score',
      sectionKey: 'effective_cybersecurity',
      categoryKey: 'security.effectiveness',
      text: 'Каков результат (в баллах)?',
      answerType: 'number',
      validation: { required: false, min: 0, max: 1000000 },
      visibleIf: {
        questionId: 's09.01.cyber_trials_participant',
        op: 'equals',
        value: 'yes',
      },
    },

    {
      id: 's09.03.bug_bounty',
      sectionKey: 'effective_cybersecurity',
      categoryKey: 'security.assurance',
      text: 'Организована ли программа Bug Bounty?',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO],
    },

    {
      id: 's09.04.pentest_done',
      sectionKey: 'effective_cybersecurity',
      categoryKey: 'security.assurance',
      text: 'Проводится ли тестирование на проникновение?',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO],
    },
    {
      id: 's09.05.pentest_frequency',
      sectionKey: 'effective_cybersecurity',
      categoryKey: 'security.assurance',
      text: 'Как часто тестирование на проникновение?',
      answerType: 'select',
      validation: { required: false },
      visibleIf: {
        questionId: 's09.04.pentest_done',
        op: 'equals',
        value: 'yes',
      },
      options: [
        { id: 'monthly', label: 'Ежемесячно', points: 1, weight: 1 },
        { id: 'quarterly', label: 'Ежеквартально', points: 0.9, weight: 0.9 },
        { id: 'semiannual', label: 'Раз в полгода', points: 0.7, weight: 0.7 },
        { id: 'annual', label: 'Ежегодно', points: 0.5, weight: 0.5 },
        { id: 'less_than_annual', label: 'Реже 1 раза в год', points: 0.2, weight: 0.2 },
        { id: 'ad_hoc', label: 'По необходимости (ad hoc)', points: 0.2, weight: 0.2 },
      ],
    },
  ],
}
