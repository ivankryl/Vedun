//  src/surveys/v2/sections/06_endpoint_protection.ts
import type { Section } from '../types'

const YES_NO = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
] as const

export const SECTION_06_ENDPOINT_PROTECTION: Section = {
  key: 'endpoint_protection',
  title: 'Управление рисками и внутренний контроль — Защита конечных точек',
  order: 7,
  questions: [
    { id: 's06.01.epp', sectionKey: 'endpoint_protection', categoryKey: 'controls.endpoint', text: 'EPP — Платформа защиты конечных точек', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's06.02.epp_vendor', sectionKey: 'endpoint_protection', categoryKey: 'controls.endpoint.vendor', text: 'Вендор/решение для EPP (если есть)', answerType: 'text' },

    { id: 's06.03.edr', sectionKey: 'endpoint_protection', categoryKey: 'controls.endpoint', text: 'EDR — Обнаружение и реагирование на угрозы на конечных точках', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's06.04.edr_vendor', sectionKey: 'endpoint_protection', categoryKey: 'controls.endpoint.vendor', text: 'Вендор/решение для EDR (если есть)', answerType: 'text' },

    { id: 's06.05.xdr', sectionKey: 'endpoint_protection', categoryKey: 'controls.endpoint', text: 'XDR — Расширенное обнаружение и реагирование', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's06.06.xdr_vendor', sectionKey: 'endpoint_protection', categoryKey: 'controls.endpoint.vendor', text: 'Вендор/решение для XDR (если есть)', answerType: 'text' },

    { id: 's06.07.antivirus', sectionKey: 'endpoint_protection', categoryKey: 'controls.endpoint', text: 'Антивирус', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's06.08.antivirus_vendor', sectionKey: 'endpoint_protection', categoryKey: 'controls.endpoint.vendor', text: 'Вендор/решение для антивируса (если есть)', answerType: 'text' },

    { id: 's06.09.endpoint_other', sectionKey: 'endpoint_protection', categoryKey: 'controls.endpoint', text: 'Иные решения (конечные точки) — используются?', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's06.10.endpoint_other_vendor', sectionKey: 'endpoint_protection', categoryKey: 'controls.endpoint.vendor', text: 'Какие именно “иные решения” (вендор/продукт)', answerType: 'text' },
  ],
}
