// src/surveys/v2/sections/12_resilience_continuity.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

export const SECTION_12_RESILIENCE_CONTINUITY: Section = {
  key: 'resilience_continuity',
  title: 'Непрерывность и восстановление (Resilience)',
  description: 'BCP/DRP/IRP, меры реагирования, целевые RTO/RPO, BIA, резервное копирование и учения.',
  order: 13,
  questions: [
    {
      id: 's12.01.bcp_exists',
      sectionKey: 'resilience_continuity',
      categoryKey: 'resilience.bcp',
      text: 'Разработаны ли в компании план и программа обеспечения непрерывности (BCP)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's12.02.drp_exists',
      sectionKey: 'resilience_continuity',
      categoryKey: 'resilience.drp',
      text: 'Разработаны ли в компании план и программа восстановления (DRP)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's12.03.irp_exists',
      sectionKey: 'resilience_continuity',
      categoryKey: 'resilience.irp',
      text: 'Разработан ли план реагирования на инциденты (IRP)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's12.04.incident_measures_description',
      sectionKey: 'resilience_continuity',
      categoryKey: 'resilience.response',
      text:
        'Какие меры применяются в случае прерывания бизнес-процессов, компрометации/утечки данных, шпионаже, выявления внутреннего нарушителя ИБ и т.п.?',
      answerType: 'text',
      validation: { required: false, maxLength: 3000 },
    },

    {
      id: 's12.05.rto_target',
      sectionKey: 'resilience_continuity',
      categoryKey: 'resilience.targets',
      text: 'Целевые показатели восстановления процесса/деятельности после инцидента (RTO: часы/дни)',
      answerType: 'text',
      validation: { required: false, maxLength: 50 },
      helpText: 'Например: "8 часов" или "2 дня".',
    },
    {
      id: 's12.06.rpo_target',
      sectionKey: 'resilience_continuity',
      categoryKey: 'resilience.targets',
      text: 'Целевые показатели точки восстановления после инцидента (RPO: часы/дни)',
      answerType: 'text',
      validation: { required: false, maxLength: 50 },
      helpText: 'Например: "1 час" или "24 часа".',
    },

    {
      id: 's12.07.bia_done',
      sectionKey: 'resilience_continuity',
      categoryKey: 'resilience.bia',
      text: 'Проводится ли оценка воздействия на бизнес (BIA)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },

    {
      id: 's12.08.backup_process',
      sectionKey: 'resilience_continuity',
      categoryKey: 'resilience.backup',
      text:
        'Опишите как устроен процесс резервного копирования: периодичность, типы данных, где хранятся копии (облако, NAS, ленточные накопители и т.п.).',
      answerType: 'text',
      validation: { required: false, maxLength: 2500 },
    },
    {
      id: 's12.09.reserve_infrastructure',
      sectionKey: 'resilience_continuity',
      categoryKey: 'resilience.backup',
      text: 'Предусмотрено ли наличие резервной инфраструктуры, которую можно использовать в случае нарушения работы основной?',
      answerType: 'text',
      validation: { required: false, maxLength: 1000 },
    },
    {
      id: 's12.10.restore_drills_annual',
      sectionKey: 'resilience_continuity',
      categoryKey: 'resilience.backup',
      text: 'Проводятся ли ежегодные учения/тестирования восстановления данных из резервных копий?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
  ],
}
