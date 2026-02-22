// src/surveys/v1/sections/25_financial_metrics.ts
import type { Section } from '../types'

export const SECTION_25_FINANCIAL_METRICS: Section = {
  key: 'financial_metrics',
  title: 'Секция 8. Финансовые показатели',
  description: 'Базовые финансовые метрики (в рублях, за год).',
  order: 26,
  questions: [
    {
      id: 's25.01.net_profit_rub_per_year',
      sectionKey: 'financial_metrics',
      categoryKey: 'finance.metrics',
      text: 'Чистая прибыль в год, рубли',
      answerType: 'number',
      validation: { required: false, min: 0 },
    },
    {
      id: 's25.02.fixed_costs_rub_per_year',
      sectionKey: 'financial_metrics',
      categoryKey: 'finance.metrics',
      text: 'Условно-постоянные расходы в год, рубли',
      answerType: 'number',
      validation: { required: false, min: 0 },
    },
    {
      id: 's25.03.it_equipment_book_value_rub',
      sectionKey: 'financial_metrics',
      categoryKey: 'finance.assets',
      text: 'Балансовая стоимость IT оборудования, рубли',
      answerType: 'number',
      validation: { required: false, min: 0 },
    },
    {
      id: 's25.04.production_equipment_book_value_rub',
      sectionKey: 'financial_metrics',
      categoryKey: 'finance.assets',
      text: 'Балансовая стоимость производственного оборудования, рубли',
      answerType: 'number',
      validation: { required: false, min: 0 },
    },
  ],
}
