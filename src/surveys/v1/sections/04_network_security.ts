//  04_network_security.ts
import type { Section } from '../types'

const YES_NO = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
] as const

export const SECTION_04_NETWORK_SECURITY: Section = {
  key: 'network_security',
  title: 'Управление рисками и внутренний контроль — Сетевая безопасность',
  order: 5,
  questions: [
    { id: 's04.01.ztna', sectionKey: 'network_security', categoryKey: 'controls.network', text: 'ZTNA — Сетевой доступ с нулевым доверием', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's04.02.ztna_vendor', sectionKey: 'network_security', categoryKey: 'controls.network.vendor', text: 'Вендор/решение для ZTNA (если есть)', answerType: 'text' },

    { id: 's04.03.nac', sectionKey: 'network_security', categoryKey: 'controls.network', text: 'NAC — Контроль доступа к сети', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's04.04.nac_vendor', sectionKey: 'network_security', categoryKey: 'controls.network.vendor', text: 'Вендор/решение для NAC (если есть)', answerType: 'text' },

    { id: 's04.05.firewall_utm', sectionKey: 'network_security', categoryKey: 'controls.network', text: 'Firewall / UTM — Межсетевой экран и универсальный шлюз безопасности', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's04.06.firewall_utm_vendor', sectionKey: 'network_security', categoryKey: 'controls.network.vendor', text: 'Вендор/решение для Firewall/UTM (если есть)', answerType: 'text' },

    { id: 's04.07.ngfw', sectionKey: 'network_security', categoryKey: 'controls.network', text: 'NGFW — Межсетевой экран нового поколения', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's04.08.ngfw_vendor', sectionKey: 'network_security', categoryKey: 'controls.network.vendor', text: 'Вендор/решение для NGFW (если есть)', answerType: 'text' },

    { id: 's04.09.ids_ips', sectionKey: 'network_security', categoryKey: 'controls.network', text: 'IDS/IPS — Системы обнаружения/предотвращения вторжений', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's04.10.ids_ips_vendor', sectionKey: 'network_security', categoryKey: 'controls.network.vendor', text: 'Вендор/решение для IDS/IPS (если есть)', answerType: 'text' },

    { id: 's04.11.swg', sectionKey: 'network_security', categoryKey: 'controls.network', text: 'SWG — Шлюз веб-безопасности, проксирование доступа', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's04.12.swg_vendor', sectionKey: 'network_security', categoryKey: 'controls.network.vendor', text: 'Вендор/решение для SWG (если есть)', answerType: 'text' },

    { id: 's04.13.seg', sectionKey: 'network_security', categoryKey: 'controls.network', text: 'SEG — Защита электронной почты', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's04.14.seg_vendor', sectionKey: 'network_security', categoryKey: 'controls.network.vendor', text: 'Вендор/решение для SEG (если есть)', answerType: 'text' },

    { id: 's04.15.waf', sectionKey: 'network_security', categoryKey: 'controls.network', text: 'WAF — Экран для защиты веб‑приложений / экран прикладного уровня', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's04.16.waf_vendor', sectionKey: 'network_security', categoryKey: 'controls.network.vendor', text: 'Вендор/решение для WAF (если есть)', answerType: 'text' },

    { id: 's04.17.antiddos', sectionKey: 'network_security', categoryKey: 'controls.network', text: 'AntiDDoS', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's04.18.antiddos_vendor', sectionKey: 'network_security', categoryKey: 'controls.network.vendor', text: 'Вендор/решение для AntiDDoS (если есть)', answerType: 'text' },

    { id: 's04.19.sandbox', sectionKey: 'network_security', categoryKey: 'controls.network', text: 'Sandbox', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's04.20.sandbox_vendor', sectionKey: 'network_security', categoryKey: 'controls.network.vendor', text: 'Вендор/решение для Sandbox (если есть)', answerType: 'text' },

    { id: 's04.21.network_other', sectionKey: 'network_security', categoryKey: 'controls.network', text: 'Иные решения (сетевая безопасность) — используются?', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's04.22.network_other_vendor', sectionKey: 'network_security', categoryKey: 'controls.network.vendor', text: 'Какие именно “иные решения” (вендор/продукт)', answerType: 'text' },
  ],
}
