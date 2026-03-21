// src/surveys/v3/sections/04_security_architecture.ts
import type { Section } from '../types';

const YES_NO_NA_OPTIONS = [
  { id: 'yes', label: 'Да', points: 1, weight: 1 },
  { id: 'no', label: 'Нет', points: 0, weight: 1 },
  { id: 'na', label: 'Не применимо', points: 1, weight: 0 },
] as const;

export const SECTION_04_SECURITY_ARCHITECTURE: Section = {
  key: 'security_architecture',
  title: 'Архитектура ИБ',
  description: 'Критерии по уровням зрелости (Да/Нет/НП).',
  order: 4,
  questions: [
    // Уровень 1
    {
      id: 's04.sarch.l1.q1',
      sectionKey: 'security_architecture',
      categoryKey: 'security_architecture.l1',
      level: 1,
      text: 'Разработаны схемы сетей компании с отображением и описанием СЗИ и компонентов инфраструктуры.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's04.sarch.l1.q2',
      sectionKey: 'security_architecture',
      categoryKey: 'security_architecture.l1',
      level: 1,
      text: 'Требования ИБ предъявляются при внедрении отдельных АС, сервисов. Требования определены как минимум в виде рабочих документов.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 2
    {
      id: 's04.sarch.l2.q1',
      sectionKey: 'security_architecture',
      categoryKey: 'security_architecture.l2',
      level: 2,
      text: 'Регламентировано управление жизненным циклом АС, включая этап проработки архитектуры ИБ. Существует роль архитектора ИБ, формализованы его функции и обязанности (возможно, роль выполняется по совместительству).',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's04.sarch.l2.q2',
      sectionKey: 'security_architecture',
      categoryKey: 'security_architecture.l2',
      level: 2,
      text: 'Разработаны архитектуры ИТ и ИБ компании со схемами информационных потоков.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's04.sarch.l2.q3',
      sectionKey: 'security_architecture',
      categoryKey: 'security_architecture.l2',
      level: 2,
      text: 'Разработаны критерии для определения критичности АС и приложений/сервисов компании.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's04.sarch.l2.q4',
      sectionKey: 'security_architecture',
      categoryKey: 'security_architecture.l2',
      level: 2,
      text: 'Произведена и поддерживается в актуальном состоянии классификация АС и приложений в соответствии с критериями критичности.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 3
    {
      id: 's04.sarch.l3.q1',
      sectionKey: 'security_architecture',
      categoryKey: 'security_architecture.l3',
      level: 3,
      text: 'Разработаны типовые требования ИБ к АС и приложениям/сервисам с учётом их критичности. Требования применяются при разработке архитектуры.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's04.sarch.l3.q2',
      sectionKey: 'security_architecture',
      categoryKey: 'security_architecture.l3',
      level: 3,
      text: 'Создан архитектурный совет, формализованы его функции, представитель подразделения ИБ — участник с правом вето.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's04.sarch.l3.q3',
      sectionKey: 'security_architecture',
      categoryKey: 'security_architecture.l3',
      level: 3,
      text: 'Все разрабатываемые архитектуры проходят согласование на архитектурном совете.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's04.sarch.l3.q4',
      sectionKey: 'security_architecture',
      categoryKey: 'security_architecture.l3',
      level: 3,
      text: 'Разработаны инструкции для подразделения ИТ по безопасному конфигурированию всех компонентов инфраструктуры.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 4
    {
      id: 's04.sarch.l4.q1',
      sectionKey: 'security_architecture',
      categoryKey: 'security_architecture.l4',
      level: 4,
      text: 'Требования ИБ к ИТ-архитектуре регулярно пересматриваются компанией, являются актуальными по отношению к текущей ИТ-инфраструктуре компании. При планировании изменений ИТ-архитектуры кроме функциональных требований определяются также требования ИБ.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 5
    {
      id: 's04.sarch.l5.q1',
      sectionKey: 'security_architecture',
      categoryKey: 'security_architecture.l5',
      level: 5,
      text: 'В компании разработаны и используются архитектурные паттерны ИБ для проектирования любых элементов ИТ-инфраструктуры.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
  ],
};

export default SECTION_04_SECURITY_ARCHITECTURE;
