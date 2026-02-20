// src/surveys/v1/sections/14_people_awareness.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

export const SECTION_14_PEOPLE_AWARENESS: Section = {
  key: 'people_awareness',
  title: 'Персонал и осведомлённость (Awareness)',
  description: 'Фишинг-симуляции и обучение сотрудников по кибербезопасности.',
  order: 15,
  questions: [
    {
      id: 's14.01.phishing_response_testing',
      sectionKey: 'people_awareness',
      categoryKey: 'people.awareness',
      text: 'Организованы ли мероприятия по тестированию сотрудников по реагированию на фишинговую рассылку?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's14.02.security_training_frequency',
      sectionKey: 'people_awareness',
      categoryKey: 'people.awareness',
      text: 'Как часто проводится обучение сотрудников по кибербезопасности?',
      answerType: 'text',
      validation: { required: false, maxLength: 200 },
      helpText: 'Например: ежеквартально/ежегодно/при найме + далее раз в год.',
    },
  ],
}
