// src/surveys/v2/sections/17_privacy_risk_inventory.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

const YES_NO_RISK: Option[] = [
  // "ДА" = есть риск/нежелательная практика -> хуже
  { id: 'yes', label: 'ДА', points: 0, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 1, weight: 0 },
]

export const SECTION_17_PRIVACY_RISK_INVENTORY: Section = {
  key: 'privacy_risk_inventory',
  title: 'Данные, риски и инвентаризация (Privacy & Risk)',
  description:
    'Персональные данные, инвентаризация ПО/оборудования, управление рисками, threat model, метрики, API, нелицензионное ПО, география и зависимость от ИТ.',
  order: 18,
  questions: [
    {
      id: 's17.01.privacy_policy_exists',
      sectionKey: 'privacy_risk_inventory',
      categoryKey: 'privacy.governance',
      text: 'Существует ли в компании политика в отношении обработки персональных данных (privacy policy)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },

    {
      id: 's17.02.software_hardware_inventory',
      sectionKey: 'privacy_risk_inventory',
      categoryKey: 'asset.inventory',
      text: 'Ведется ли инвентаризация ПО и оборудования?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },

    {
      id: 's17.03.risks_identified',
      sectionKey: 'privacy_risk_inventory',
      categoryKey: 'risk.management',
      text: 'Идентифицируются ли риски нарушения информационной безопасности?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's17.04.threat_modeling',
      sectionKey: 'privacy_risk_inventory',
      categoryKey: 'risk.threat_model',
      text: 'Делаете ли threat model (модель угроз/нарушителя)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's17.05.risk_metrics',
      sectionKey: 'privacy_risk_inventory',
      categoryKey: 'risk.metrics',
      text: 'Используются ли метрики и показатели эффективности программы ИБ?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's17.06.risk_metrics_examples',
      sectionKey: 'privacy_risk_inventory',
      categoryKey: 'risk.metrics',
      text: 'Если да — какие именно метрики/показатели используете? (примеры)',
      answerType: 'text',
      validation: { required: false, maxLength: 1500 },
      visibleIf: { questionId: 's17.05.risk_metrics', op: 'equals', value: 'yes' },
    },

    {
      id: 's17.07.external_api_used',
      sectionKey: 'privacy_risk_inventory',
      categoryKey: 'integration.api',
      text: 'Используются ли у вас внешние API (партнеров/провайдеров) в продуктах/сервисах?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's17.08.external_api_list',
      sectionKey: 'privacy_risk_inventory',
      categoryKey: 'integration.api',
      text: 'Если да — перечислите ключевые внешние API/поставщиков и для чего они используются',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
      visibleIf: { questionId: 's17.07.external_api_used', op: 'equals', value: 'yes' },
    },

    {
      id: 's17.09.unlicensed_software_used',
      sectionKey: 'privacy_risk_inventory',
      categoryKey: 'compliance.software',
      text: 'Есть ли в компании случаи использования нелицензионного ПО?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_RISK,
      isRisk: true,
    },

    {
      id: 's17.10.geography',
      sectionKey: 'privacy_risk_inventory',
      categoryKey: 'org.geography',
      text:
        'Опишите географию присутствия компании (страны/регионы), а также где расположены ключевые ИТ‑ресурсы/пользователи (если применимо).',
      answerType: 'text',
      validation: { required: false, maxLength: 1500 },
    },

    {
      id: 's17.11.it_dependency',
      sectionKey: 'privacy_risk_inventory',
      categoryKey: 'org.dependency',
      text: 'Насколько компания зависима от ИТ? (кратко: низкая/средняя/высокая + комментарий)',
      answerType: 'text',
      validation: { required: false, maxLength: 500 },
    },
  ],
}
