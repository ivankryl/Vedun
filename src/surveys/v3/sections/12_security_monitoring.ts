// src/surveys/v3/sections/12_security_monitoring.ts
import type { Section } from '../types';

const YES_NO_NA_OPTIONS = [
  { id: 'yes', label: 'Да', points: 1, weight: 1 },
  { id: 'no', label: 'Нет', points: 0, weight: 1 },
  { id: 'na', label: 'Не применимо', points: 1, weight: 0 },
] as const;

export const SECTION_12_SECURITY_MONITORING: Section = {
  key: 'security_monitoring',
  title: 'Мониторинг ИБ',
  description: 'Критерии по уровням зрелости (Да/Нет/НП).',
  order: 12,
  questions: [
    // Уровень 1
    {
      id: 's12.mon.l1.q1',
      sectionKey: 'security_monitoring',
      categoryKey: 'security_monitoring.l1',
      level: 1,
      text: 'Настроены политики журналирования событий ИБ на средствах защиты информации и в критичных системах.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's12.mon.l1.q2',
      sectionKey: 'security_monitoring',
      categoryKey: 'security_monitoring.l1',
      level: 1,
      text: 'Производится анализ журналов событий ИБ со средств защиты.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 2
    {
      id: 's12.mon.l2.q1',
      sectionKey: 'security_monitoring',
      categoryKey: 'security_monitoring.l2',
      level: 2,
      text: 'Средства защиты и критичные системы подключены к системе сбора событий ИБ.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's12.mon.l2.q2',
      sectionKey: 'security_monitoring',
      categoryKey: 'security_monitoring.l2',
      level: 2,
      text: 'Настроены оповещения в случае возникновения критичного события ИБ.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's12.mon.l2.q3',
      sectionKey: 'security_monitoring',
      categoryKey: 'security_monitoring.l2',
      level: 2,
      text: 'Регламентированы требования к настройкам журналирования событий ИБ в системах (в том числе, событий ИТ, важных с точки зрения ИБ).',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's12.mon.l2.q4',
      sectionKey: 'security_monitoring',
      categoryKey: 'security_monitoring.l2',
      level: 2,
      text: 'Используется SIEM-система/внешний SOC. Сбор событий производится со всех АРМ и серверов.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 3
    {
      id: 's12.mon.l3.q1',
      sectionKey: 'security_monitoring',
      categoryKey: 'security_monitoring.l3',
      level: 3,
      text: 'Определены и классифицированы возможные типы инцидентов ИБ и критерии их возникновения. Разработаны playbook’и по выявлению различных инцидентов.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's12.mon.l3.q2',
      sectionKey: 'security_monitoring',
      categoryKey: 'security_monitoring.l3',
      level: 3,
      text: 'Разработаны правила нормализации данных и корреляции событий ИБ, индивидуальные правила для критичных систем.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's12.mon.l3.q3',
      sectionKey: 'security_monitoring',
      categoryKey: 'security_monitoring.l3',
      level: 3,
      text: 'Производится регулярная оценка и пересмотр правил корреляции событий ИБ.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 4
    {
      id: 's12.mon.l4.q1',
      sectionKey: 'security_monitoring',
      categoryKey: 'security_monitoring.l4',
      level: 4,
      text: 'Используется решение для поведенческого анализа пользователей и формирования поведенческих профилей работников (например, UEBA).',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's12.mon.l4.q2',
      sectionKey: 'security_monitoring',
      categoryKey: 'security_monitoring.l4',
      level: 4,
      text: 'Производится обогащение правил мониторинга событий ИБ на основе данных c TI (источников информации Threat Intelligence).',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 5
    {
      id: 's12.mon.l5.q1',
      sectionKey: 'security_monitoring',
      categoryKey: 'security_monitoring.l5',
      level: 5,
      text: 'Производится корреляция событий ИБ из нескольких источников (цепочка правил) для обнаружения сложных атак.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
  ],
};

export default SECTION_12_SECURITY_MONITORING;
