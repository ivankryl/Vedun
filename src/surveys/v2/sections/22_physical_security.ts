// src/surveys/v1/sections/22_physical_security.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

export const SECTION_22_PHYSICAL_SECURITY: Section = {
  key: 'physical_security',
  title: 'Физическая безопасность (Physical)',
  description: 'Офисы/помещения, доступ посетителей, хранение и уничтожение носителей.',
  order: 23,
  questions: [
    {
      id: 's22.01.physical_access_controls',
      sectionKey: 'physical_security',
      categoryKey: 'physical.access',
      text: 'Есть ли меры физического контроля доступа в офис/серверные (пропуска, охрана, турникеты, видеонаблюдение)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's22.02.visitor_management',
      sectionKey: 'physical_security',
      categoryKey: 'physical.visitors',
      text: 'Организован ли учет и сопровождение посетителей (журнал, бейджи, сопровождение)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's22.03.media_disposal',
      sectionKey: 'physical_security',
      categoryKey: 'physical.media',
      text: 'Определен ли порядок безопасного вывода из эксплуатации/уничтожения носителей (диски, флешки, бумага)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's22.04.media_disposal_process',
      sectionKey: 'physical_security',
      categoryKey: 'physical.media',
      text: 'Если да — опишите процесс уничтожения/очистки (wipe, шредер, акты, подрядчики).',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
      visibleIf: { questionId: 's22.03.media_disposal', op: 'equals', value: 'yes' },
    },
  ],
}
