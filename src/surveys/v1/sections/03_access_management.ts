//  03_access_management.ts
import type { Section } from '../types'

const YES_NO = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
] as const

export const SECTION_03_ACCESS_MANAGEMENT: Section = {
  key: 'access_management',
  title: 'Управление рисками и внутренний контроль — Управление доступом',
  order: 4,
  questions: [
    { id: 's03.01.sso', sectionKey: 'access_management', categoryKey: 'controls.access', text: 'SSO — Единый логин для всех систем / однократная аутентификация', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's03.02.sso_vendor', sectionKey: 'access_management', categoryKey: 'controls.access.vendor', text: 'Вендор/решение для SSO (если есть)', answerType: 'text' },

    { id: 's03.03.iga', sectionKey: 'access_management', categoryKey: 'controls.access', text: 'IGA — Управление идентичностями и доступом', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's03.04.iga_vendor', sectionKey: 'access_management', categoryKey: 'controls.access.vendor', text: 'Вендор/решение для IGA (если есть)', answerType: 'text' },

    { id: 's03.05.idm', sectionKey: 'access_management', categoryKey: 'controls.access', text: 'IDM — Управление идентификацией', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's03.06.idm_vendor', sectionKey: 'access_management', categoryKey: 'controls.access.vendor', text: 'Вендор/решение для IDM (если есть)', answerType: 'text' },

    { id: 's03.07.iam', sectionKey: 'access_management', categoryKey: 'controls.access', text: 'IAM — Управление доступом и идентификацией', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's03.08.iam_vendor', sectionKey: 'access_management', categoryKey: 'controls.access.vendor', text: 'Вендор/решение для IAM (если есть)', answerType: 'text' },

    { id: 's03.09.mfa', sectionKey: 'access_management', categoryKey: 'controls.access', text: 'MFA — Многофакторная аутентификация', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's03.10.mfa_vendor', sectionKey: 'access_management', categoryKey: 'controls.access.vendor', text: 'Вендор/решение для MFA (если есть)', answerType: 'text' },

    { id: 's03.11.ciam', sectionKey: 'access_management', categoryKey: 'controls.access', text: 'CIAM — Управление идентификацией клиентов', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's03.12.ciam_vendor', sectionKey: 'access_management', categoryKey: 'controls.access.vendor', text: 'Вендор/решение для CIAM (если есть)', answerType: 'text' },

    { id: 's03.13.itdr', sectionKey: 'access_management', categoryKey: 'controls.access', text: 'ITDR — Обнаружение и реагирование на угрозы идентификации', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's03.14.itdr_vendor', sectionKey: 'access_management', categoryKey: 'controls.access.vendor', text: 'Вендор/решение для ITDR (если есть)', answerType: 'text' },

    { id: 's03.15.idp', sectionKey: 'access_management', categoryKey: 'controls.access', text: 'IDP — Провайдер идентификации', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's03.16.idp_vendor', sectionKey: 'access_management', categoryKey: 'controls.access.vendor', text: 'Вендор/решение для IDP (если есть)', answerType: 'text' },

    { id: 's03.17.nopass', sectionKey: 'access_management', categoryKey: 'controls.access', text: 'NoPass — Аутентификация без паролей', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's03.18.nopass_vendor', sectionKey: 'access_management', categoryKey: 'controls.access.vendor', text: 'Вендор/решение для NoPass (если есть)', answerType: 'text' },

    { id: 's03.19.pam', sectionKey: 'access_management', categoryKey: 'controls.access', text: 'PAM — Управление привилегированным доступом', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's03.20.pam_vendor', sectionKey: 'access_management', categoryKey: 'controls.access.vendor', text: 'Вендор/решение для PAM (если есть)', answerType: 'text' },

    { id: 's03.21.access_other', sectionKey: 'access_management', categoryKey: 'controls.access', text: 'Иные решения (управление доступом) — используются?', answerType: 'radio', validation: { required: true }, options: [...YES_NO] },
    { id: 's03.22.access_other_vendor', sectionKey: 'access_management', categoryKey: 'controls.access.vendor', text: 'Какие именно “иные решения” (вендор/продукт)', answerType: 'text' },
  ],
}
