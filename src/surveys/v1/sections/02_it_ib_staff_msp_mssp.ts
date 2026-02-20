// src/surveys/v1/sections/02_it_ib_staff_msp_mssp.ts
import type { Section } from '../types'

const YES_NO_OPTIONS = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
] as const

export const SECTION_02_IT_IB_STAFF_MSP_MSSP: Section = {
  key: 'it_ib_staff_msp_mssp',
  title: 'Штат ИТ/ИБ/MSP/MSSP',
  description:
    'Оргструктура и ресурсы ИТ/ИБ (штат, бюджеты, SOC/MDR/IRT).',
  order: 3,
  questions: [
    {
      id: 's02.01.it_staff_size',
      sectionKey: 'it_ib_staff_msp_mssp',
      categoryKey: 'org.resources',
      text: 'Штат ИТ, человек',
      answerType: 'select',
      validation: { required: true },
      options: [
        { id: 'lt_5', label: 'до 5', points: 0, weight: 0 },
        { id: '5_15', label: '5–15', points: 0.33, weight: 0.33 },
        { id: '15_50', label: '15–50', points: 0.66, weight: 0.66 },
        { id: 'gt_50', label: 'более 50', points: 1, weight: 1 },
      ],
    },

    {
      id: 's02.02.security_structure_documented',
      sectionKey: 'it_ib_staff_msp_mssp',
      categoryKey: 'org.governance',
      text: 'Описание структуры ИБ (утверждено руководством)',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },

    {
      id: 's02.03.separate_security_company',
      sectionKey: 'it_ib_staff_msp_mssp',
      categoryKey: 'org.governance',
      text: 'Выделена ли в структуре отдельная компания под ИБ?',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },

    {
      id: 's02.04.security_budget_mln',
      sectionKey: 'it_ib_staff_msp_mssp',
      categoryKey: 'org.budget',
      text:
        'Ежегодно выделяемый бюджет на развитие ИБ (без ФОТ) в текущем и следующем году (млн)',
      answerType: 'select',
      validation: { required: true },
      options: [
        { id: 'lt_50', label: 'до 50', points: 0, weight: 0 },
        { id: '50_100', label: '50–100', points: 0.33, weight: 0.33 },
        { id: '100_300', label: '100–300', points: 0.66, weight: 0.66 },
        { id: 'gt_300', label: 'свыше 300', points: 1, weight: 1 },
      ],
    },

    {
      id: 's02.05.it_budget_mln',
      sectionKey: 'it_ib_staff_msp_mssp',
      categoryKey: 'org.budget',
      text: 'Ежегодно выделяемый бюджет на развитие ИТ (без ФОТ) (млн)',
      answerType: 'select',
      validation: { required: true },
      options: [
        { id: 'lt_50', label: 'до 50', points: 0, weight: 0 },
        { id: '50_100', label: '50–100', points: 0.33, weight: 0.33 },
        { id: '100_300', label: '100–300', points: 0.66, weight: 0.66 },
        { id: 'gt_300', label: 'свыше 300', points: 1, weight: 1 },
      ],
    },

    {
      id: 's02.06.soc_team_present',
      sectionKey: 'it_ib_staff_msp_mssp',
      categoryKey: 'security.operations',
      text: 'Сформирована ли внутренняя или привлекается ли внешняя команда SOC?',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },

    {
      id: 's02.07.soc_mdr_used',
      sectionKey: 'it_ib_staff_msp_mssp',
      categoryKey: 'security.operations',
      text: 'Привлекается ли команда SOC MDR?',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },

    {
      id: 's02.08.irt_team_model',
      sectionKey: 'it_ib_staff_msp_mssp',
      categoryKey: 'security.incident_response',
      text: 'Сформирована ли внутренняя или привлекается ли внешняя команда IRT?',
      answerType: 'radio',
      validation: { required: true },
      options: [
        // обе опции означают, что IRT есть → обе "хорошо"
        { id: 'internal', label: 'Внутренняя', points: 1, weight: 1 },
        { id: 'external', label: 'Внешняя', points: 1, weight: 1 },
      ],
    },
  ],
}
