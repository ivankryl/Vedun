// src/surveys/v1/sections/21_incident_response_monitoring.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

export const SECTION_21_INCIDENT_RESPONSE_MONITORING: Section = {
  key: 'incident_response_monitoring',
  title: 'Инциденты, мониторинг и устойчивость (IR/Monitoring/BCP-DR)',
  description: 'Реагирование на инциденты, SOC/мониторинг, тестирование планов, BCP/DR.',
  order: 22,
  questions: [
    {
      id: 's21.01.ir_plan_exists',
      sectionKey: 'incident_response_monitoring',
      categoryKey: 'ir.governance',
      text: 'Существует ли в компании план реагирования на инциденты ИБ (Incident Response Plan)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's21.02.ir_playbooks',
      sectionKey: 'incident_response_monitoring',
      categoryKey: 'ir.process',
      text: 'Есть ли плейбуки/сценарии реагирования (фишинг, ransomware, утечка данных, компрометация учетных записей и т.п.)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's21.03.ir_exercises',
      sectionKey: 'incident_response_monitoring',
      categoryKey: 'ir.testing',
      text: 'Проводятся ли учения/тестирование реагирования (tabletop, технические тренировки)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's21.04.ir_exercises_frequency',
      sectionKey: 'incident_response_monitoring',
      categoryKey: 'ir.testing',
      text: 'Если да — как часто проводятся учения/тесты?',
      answerType: 'text',
      validation: { required: false, maxLength: 200 },
      visibleIf: { questionId: 's21.03.ir_exercises', op: 'equals', value: 'yes' },
    },

    {
      id: 's21.05.soc_or_monitoring',
      sectionKey: 'incident_response_monitoring',
      categoryKey: 'monitoring.soc',
      text: 'Организован ли SOC/круглосуточный мониторинг событий ИБ (внутренний или внешний)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's21.06.monitoring_tools',
      sectionKey: 'incident_response_monitoring',
      categoryKey: 'monitoring.tools',
      text: 'Какие средства мониторинга/корреляции используются (SIEM, EDR, NDR и т.п.)?',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
    },

    {
      id: 's21.07.bcp_exists',
      sectionKey: 'incident_response_monitoring',
      categoryKey: 'bcp.governance',
      text: 'Есть ли план обеспечения непрерывности бизнеса (BCP) и/или аварийного восстановления (DRP)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's21.08.bcp_drp_testing',
      sectionKey: 'incident_response_monitoring',
      categoryKey: 'bcp.testing',
      text: 'Проводится ли тестирование BCP/DRP (восстановление, переключения, резервные площадки)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
      visibleIf: { questionId: 's21.07.bcp_exists', op: 'equals', value: 'yes' },
    },
    {
      id: 's21.09.rto_rpo_defined',
      sectionKey: 'incident_response_monitoring',
      categoryKey: 'bcp.requirements',
      text: 'Определены ли целевые показатели восстановления (RTO/RPO) для критичных сервисов?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
      visibleIf: { questionId: 's21.07.bcp_exists', op: 'equals', value: 'yes' },
    },
  ],
}
