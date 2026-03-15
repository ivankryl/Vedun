// src/surveys/v2/sections/15_cloud_security.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

export const SECTION_15_CLOUD_SECURITY: Section = {
  key: 'cloud_security',
  title: 'Облако и его защита (Cloud)',
  description: 'Использование облачной инфраструктуры и меры защиты.',
  order: 16,
  questions: [
    {
      id: 's15.01.cloud_used',
      sectionKey: 'cloud_security',
      categoryKey: 'cloud.general',
      text: 'Используются ли в компании технологии облачных вычислений (облачная инфраструктура)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's15.02.cloud_protection',
      sectionKey: 'cloud_security',
      categoryKey: 'cloud.security',
      text: 'Как обеспечена защита облачных вычислений?',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
      visibleIf: { questionId: 's15.01.cloud_used', op: 'equals', value: 'yes' },
    },
  ],
}
