// src/surveys/v2/sections/24_compliance_audit_certifications.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

export const SECTION_24_COMPLIANCE_AUDIT_CERTIFICATIONS: Section = {
  key: 'compliance_audit_certifications',
  title: 'Комплаенс, аудиты и сертификаты (Compliance)',
  description: 'Регуляторные требования, внутренние/внешние аудиты, сертификации, набор политик.',
  order: 25,
  questions: [
    {
      id: 's24.01.compliance_requirements',
      sectionKey: 'compliance_audit_certifications',
      categoryKey: 'compliance.requirements',
      text: 'Какие комплаенс/регуляторные требования применимы (например, GDPR, 152‑ФЗ, PCI DSS, ISO 27001, SOC 2 и т.п.)?',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
    },

    {
      id: 's24.02.internal_audits',
      sectionKey: 'compliance_audit_certifications',
      categoryKey: 'compliance.audit',
      text: 'Проводятся ли внутренние аудиты информационной безопасности?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's24.03.external_audits',
      sectionKey: 'compliance_audit_certifications',
      categoryKey: 'compliance.audit',
      text: 'Проводятся ли внешние аудиты/оценки (клиентские, независимые аудиторы, сертификация)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's24.04.audits_frequency',
      sectionKey: 'compliance_audit_certifications',
      categoryKey: 'compliance.audit',
      text: 'Как часто проводятся аудиты/оценки (внутренние и/или внешние)?',
      answerType: 'text',
      validation: { required: false, maxLength: 200 },
      visibleIf: {
        any: [
          { questionId: 's24.02.internal_audits', op: 'equals', value: 'yes' },
          { questionId: 's24.03.external_audits', op: 'equals', value: 'yes' },
        ],
      },
    },

    {
      id: 's24.05.certifications',
      sectionKey: 'compliance_audit_certifications',
      categoryKey: 'compliance.certifications',
      text: 'Есть ли действующие сертификаты/аттестации (ISO 27001, SOC 2, PCI DSS и т.п.)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's24.06.certifications_list',
      sectionKey: 'compliance_audit_certifications',
      categoryKey: 'compliance.certifications',
      text: 'Если да — перечислите сертификаты/область охвата/срок действия.',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
      visibleIf: { questionId: 's24.05.certifications', op: 'equals', value: 'yes' },
    },

    {
      id: 's24.07.policies_set',
      sectionKey: 'compliance_audit_certifications',
      categoryKey: 'compliance.policies',
      text: 'Утвержден ли набор основных политик/регламентов ИБ (пароли, доступы, данные, удаленная работа, инциденты и т.д.)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
  ],
}
