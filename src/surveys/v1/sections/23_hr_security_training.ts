// src/surveys/v1/sections/23_hr_security_training.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

export const SECTION_23_HR_SECURITY_TRAINING: Section = {
  key: 'hr_security_training',
  title: 'Кадровая безопасность и обучение (HR Security)',
  description: 'Онбординг/оффбординг, обучение ИБ, NDA/обязательства.',
  order: 24,
  questions: [
    {
      id: 's23.01.onboarding_access_process',
      sectionKey: 'hr_security_training',
      categoryKey: 'hr.onboarding',
      text: 'Опишите процесс предоставления доступов при найме (онбординг).',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
    },
    {
      id: 's23.02.offboarding_access_revocation',
      sectionKey: 'hr_security_training',
      categoryKey: 'hr.offboarding',
      text: 'Есть ли процесс своевременного отзыва доступов при увольнении/смене роли (оффбординг)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's23.03.security_training',
      sectionKey: 'hr_security_training',
      categoryKey: 'hr.training',
      text: 'Проводится ли регулярное обучение сотрудников по ИБ (в т.ч. фишинг, социнж, работа с данными)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's23.04.training_frequency',
      sectionKey: 'hr_security_training',
      categoryKey: 'hr.training',
      text: 'Если да — как часто проводится обучение?',
      answerType: 'text',
      validation: { required: false, maxLength: 200 },
      visibleIf: { questionId: 's23.03.security_training', op: 'equals', value: 'yes' },
    },
    {
      id: 's23.05.ndas_signed',
      sectionKey: 'hr_security_training',
      categoryKey: 'hr.legal',
      text: 'Подписывают ли сотрудники NDA/обязательства о неразглашении (или аналог)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
  ],
}
