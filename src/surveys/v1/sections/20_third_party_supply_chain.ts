// src/surveys/v1/sections/20_third_party_supply_chain.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

export const SECTION_20_THIRD_PARTY_SUPPLY_CHAIN: Section = {
  key: 'third_party_supply_chain',
  title: 'Контрагенты и цепочка поставок (Third‑party)',
  description: 'Аутсорсинг, доступы подрядчиков, оценка рисков поставщиков и контроль.',
  order: 21,
  questions: [
    {
      id: 's20.01.outsourcing_used',
      sectionKey: 'third_party_supply_chain',
      categoryKey: 'thirdparty.general',
      text: 'Используется ли аутсорсинг (ИТ/разработка/поддержка/облако/прочее)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's20.02.outsourcing_what',
      sectionKey: 'third_party_supply_chain',
      categoryKey: 'thirdparty.general',
      text: 'Если да — какие функции/системы на аутсорсинге?',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
      visibleIf: { questionId: 's20.01.outsourcing_used', op: 'equals', value: 'yes' },
    },

    {
      id: 's20.03.vendors_access_to_systems',
      sectionKey: 'third_party_supply_chain',
      categoryKey: 'thirdparty.access',
      text: 'Имеют ли подрядчики/поставщики доступ к вашим информационным системам или данным?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's20.04.vendors_access_controls',
      sectionKey: 'third_party_supply_chain',
      categoryKey: 'thirdparty.access',
      text: 'Если да — опишите, как контролируются такие доступы (ограничения, VPN/MFA, сроки, заявки, мониторинг).',
      answerType: 'text',
      validation: { required: false, maxLength: 2500 },
      visibleIf: { questionId: 's20.03.vendors_access_to_systems', op: 'equals', value: 'yes' },
    },

    {
      id: 's20.05.vendor_security_assessment',
      sectionKey: 'third_party_supply_chain',
      categoryKey: 'thirdparty.risk',
      text: 'Проводится ли оценка рисков/безопасности поставщиков (до заключения договора и далее регулярно)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's20.06.vendor_security_assessment_process',
      sectionKey: 'third_party_supply_chain',
      categoryKey: 'thirdparty.risk',
      text: 'Если да — опишите процесс и критерии (анкеты, аудит, сертификаты, SLA, требования к ИБ).',
      answerType: 'text',
      validation: { required: false, maxLength: 2500 },
      visibleIf: { questionId: 's20.05.vendor_security_assessment', op: 'equals', value: 'yes' },
    },

    {
      id: 's20.07.security_requirements_in_contracts',
      sectionKey: 'third_party_supply_chain',
      categoryKey: 'thirdparty.contracts',
      text: 'Закреплены ли требования ИБ в договорах с подрядчиками (конфиденциальность, инциденты, сроки уведомления, меры защиты)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
  ],
}
