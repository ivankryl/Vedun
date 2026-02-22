// src/surveys/v2/sections/01_insurance_protection.ts
import type { Section } from '../types'

const YES_NO_OPTIONS = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
] as const

export const SECTION_01_INSURANCE_PROTECTION: Section = {
  key: 'insurance_protection',
  title: 'Страховая защита',
  description: 'Риски и последствия реализации рисков (да/нет).',
  order: 2,
  questions: [
    // Риски
    {
      id: 's01.01.targeted_attack',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.risks',
      text:
        'Целенаправленная (таргетированная) компьютерная атака (захват контроля/повышение прав, дестабилизация, отказ в обслуживании), совершенная третьими лицами (хакерская атака)',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.02.malware_infection',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.risks',
      text:
        'Внедрение вредоносных компьютерных программ (вирусов), разработанных третьими лицами, в информационную систему страхователя',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.03.tech_failures_internal',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.risks',
      text:
        'Внезапные и непредвиденные технические сбои в работе информационной системы, непреднамеренные ошибки работников страхователя, которые привели к таким сбоям',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.04.tech_failures_contractors',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.risks',
      text:
        'Дополнительное расширение: ошибки со стороны подрядчиков, которые привели к техническим сбоям',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.05.insider_attack',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.risks',
      text:
        'Кибер-атака, умышленно совершенная работниками страхователя (в одиночку или в сговоре) и связанная с рисками целенаправленной атаки и внедрения ВПО',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },

    // Последствия реализации рисков
    {
      id: 's01.06.data_or_software_loss',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.impacts',
      text:
        'Утрата электронных данных и/или компьютерных программ, находящихся в собственности или законном владении/пользовании страхователя',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.07.compute_resource_abuse',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.impacts',
      text:
        'Неправомерное использование вычислительных ресурсов страхователя третьими лицами (спам-рассылки, участие в botnet-сети от имени страхователя, майнинг), приводящее к причинению вреда третьим лицам',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.08.extortion',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.impacts',
      text: 'Кибер-вымогательство в отношении страхователя (не включает сумму выкупа)',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },

    {
      id: 's01.09.business_interruption',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.impacts',
      text: 'Перерыв в коммерческой (производственной) деятельности страхователя',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.10.lost_net_profit',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.impacts',
      text: 'Недополученная чистая прибыль',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.11.fixed_costs',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.impacts',
      text: 'Условно-постоянные расходы',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },

    {
      id: 's01.12.confidentiality_breach_liability',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.liability',
      text:
        'Требования о возмещении вреда в связи с наступлением ответственности перед третьими лицами за вред, причиненный в результате нарушения конфиденциальности',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.13.bodily_injury_liability',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.liability',
      text:
        'Требования о возмещении вреда в связи с причинением вреда жизни и здоровью третьих лиц',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.14.property_damage_liability',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.liability',
      text:
        'Требования о возмещении вреда в связи с причинением вреда имущественным интересам третьих лиц',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },

    {
      id: 's01.15.funds_theft',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.impacts',
      text:
        'Хищение денежных средств в электронной форме со счета страхователя третьими лицами',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.16.it_equipment_damage',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.impacts',
      text: 'Гибель или повреждение компьютерного оборудования страхователя',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.17.production_equipment_damage',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.impacts',
      text: 'Гибель или повреждение производственного оборудования страхователя',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
    {
      id: 's01.18.goods_damage',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.impacts',
      text: 'Гибель или повреждение готовой продукции, сырья, материалов',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },

    {
      id: 's01.19.reputation_damage',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.impacts',
      text:
        'Ущерб деловой репутации страхователя (сохранение клиентов, рассылка/оповещение, связи с общественностью, антикризисный PR)',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },

    {
      id: 's01.20.security_incident_response_costs',
      sectionKey: 'insurance_protection',
      categoryKey: 'insurance.costs',
      text:
        'Расходы страхователя в связи с нарушением безопасности (диагностика ИС, устранение/минимизация последствий, отражение атаки, форензика, защита в суде)',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_OPTIONS],
    },
  ],
}
