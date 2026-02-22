// src/surveys/v1/sections/11_secops_incident_threat_intel.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

const YES_NO_RISK: Option[] = [
  // "ДА" = был инцидент/практика с риском -> хуже
  { id: 'yes', label: 'ДА', points: 0, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 1, weight: 0 },
]

export const SECTION_11_SECOPS_INCIDENT_THREAT_INTEL: Section = {
  key: 'secops_incident_threat_intel',
  title: 'Операционная ИБ: угрозы и инциденты (SecOps)',
  description: 'Киберразведка/Threat Intel, рассылки, процесс управления инцидентами, DDoS и коммуникации.',
  order: 12,
  questions: [
    {
      id: 's11.01.threat_intel_used',
      sectionKey: 'secops_incident_threat_intel',
      categoryKey: 'secops.threat_intel',
      text: 'Используется ли кибер-разведка/аналитика кибер-угроз в обеспечении ИБ организации?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's11.02.threat_intel_sources',
      sectionKey: 'secops_incident_threat_intel',
      categoryKey: 'secops.threat_intel',
      text:
        'Какие используются источники аналитики о кибер-угрозах? (Например, Group-IB Threat Intelligence, Kaspersky Threat Intelligence, CheckPoint TI, Microsoft TI и др.)',
      answerType: 'text',
      validation: { required: false, maxLength: 1500 },
      visibleIf: { questionId: 's11.01.threat_intel_used', op: 'equals', value: 'yes' },
    },
    {
      id: 's11.03.threat_alerts_mailings',
      sectionKey: 'secops_incident_threat_intel',
      categoryKey: 'secops.awareness',
      text: 'Осуществляются ли информационные рассылки в случае выявления потенциальных угроз?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's11.04.incident_management_process',
      sectionKey: 'secops_incident_threat_intel',
      categoryKey: 'secops.incident',
      text:
        'Определен ли процесс управления инцидентами ИБ и сформирована ли команда реагирования на инциденты ИБ с определёнными ролями и ответственностью?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's11.05.ddos_over_12h',
      sectionKey: 'secops_incident_threat_intel',
      categoryKey: 'secops.incident',
      text: 'Были ли случаи DDoS-атак на компанию, которые приводили к прерыванию бизнес-процессов более чем на 12 часов?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_RISK,
      isRisk: true,
    },
    {
      id: 's11.06.incident_communications_known',
      sectionKey: 'secops_incident_threat_intel',
      categoryKey: 'secops.incident',
      text: 'Проинформированы ли сотрудники о методах и порядке коммуникаций в случае возникновения/обнаружения инцидента ИБ?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
  ],
}
