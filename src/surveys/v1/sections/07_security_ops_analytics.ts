//  07_security_ops_analytics.ts
import type { Section } from '../types'

const YES_NO = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
] as const

export const SECTION_07_SECURITY_OPS_ANALYTICS: Section = {
  key: 'security_ops_analytics',
  title: 'Управление рисками и внутренний контроль — Анализ, контроль и реагирование на угрозы ИБ',
  order: 8,
  questions: [
    { id: 's07.01.vm', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops', text: 'VM — Выявление и устранение уязвимостей', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's07.02.vm_vendor', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops.vendor', text: 'Вендор/решение для VM (если есть)', answerType: 'text' },

    { id: 's07.03.asm', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops', text: 'ASM — Мониторинг поверхности атак', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's07.04.asm_vendor', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops.vendor', text: 'Вендор/решение для ASM (если есть)', answerType: 'text' },

    { id: 's07.05.bas', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops', text: 'BAS — Симуляция атак и тестирование безопасности', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's07.06.bas_vendor', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops.vendor', text: 'Вендор/решение для BAS (если есть)', answerType: 'text' },

    { id: 's07.07.csam', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops', text: 'CSAM — Управление безопасностью конфигураций', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's07.08.csam_vendor', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops.vendor', text: 'Вендор/решение для CSAM (если есть)', answerType: 'text' },

    { id: 's07.09.siem', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops', text: 'SIEM — Управление событиями и информацией безопасности', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's07.10.siem_vendor', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops.vendor', text: 'Вендор/решение для SIEM (если есть)', answerType: 'text' },

    { id: 's07.11.nta', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops', text: 'NTA — Аналитика сетевого трафика', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's07.12.nta_vendor', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops.vendor', text: 'Вендор/решение для NTA (если есть)', answerType: 'text' },

    { id: 's07.13.ndr', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops', text: 'NDR — Обнаружение и реагирование на сетевые угрозы', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's07.14.ndr_vendor', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops.vendor', text: 'Вендор/решение для NDR (если есть)', answerType: 'text' },

    { id: 's07.15.ueba', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops', text: 'UEBA — Аналитика поведения пользователей и сущностей', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's07.16.ueba_vendor', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops.vendor', text: 'Вендор/решение для UEBA (если есть)', answerType: 'text' },

    { id: 's07.17.soar', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops', text: 'SOAR — Автоматизация безопасности, оркестрирование и реагирование', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's07.18.soar_vendor', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops.vendor', text: 'Вендор/решение для SOAR (если есть)', answerType: 'text' },

    { id: 's07.19.irp', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops', text: 'IRP — Платформа реагирования на инциденты', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's07.20.irp_vendor', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops.vendor', text: 'Вендор/решение для IRP (если есть)', answerType: 'text' },

    { id: 's07.21.secops_other', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops', text: 'Иные решения (secops) — используются?', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's07.22.secops_other_vendor', sectionKey: 'security_ops_analytics', categoryKey: 'controls.secops.vendor', text: 'Какие именно “иные решения” (вендор/продукт)', answerType: 'text' },
  ],
}
