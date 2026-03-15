// src/surveys/v3/sections/07_change_mgmt.ts
import type { Section } from '../types';

const YES_NO_NA_OPTIONS = [
  { id: 'yes', label: 'Да', points: 1, weight: 1 },
  { id: 'no', label: 'Нет', points: 0, weight: 1 },
  { id: 'na', label: 'Не применимо', points: 1, weight: 0 },
] as const;

export const SECTION_07_CHANGE_MGMT: Section = {
  key: 'change_mgmt',
  title: 'Управление изменениями',
  description: 'Критерии по уровням зрелости (Да/Нет/НП).',
  order: 7,
  questions: [
    // Уровень 1
    {
      id: 's07.chg.l1.q1',
      sectionKey: 'change_mgmt',
      categoryKey: 'change_mgmt.l1',
      level: 1,
      text: 'Определён (возможно, только в виде рабочих документов) перечень ключевых изменений в ИТ-инфраструктуре, требующих согласования с ответственным за ИБ в компании.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's07.chg.l1.q2',
      sectionKey: 'change_mgmt',
      categoryKey: 'change_mgmt.l1',
      level: 1,
      text: 'Требования по согласованию изменений доведены до ответственных лиц.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 2
    {
      id: 's07.chg.l2.q1',
      sectionKey: 'change_mgmt',
      categoryKey: 'change_mgmt.l2',
      level: 2,
      text: 'Все ключевые изменения в ИТ-инфраструктуре согласовываются с подразделением ИБ.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's07.chg.l2.q2',
      sectionKey: 'change_mgmt',
      categoryKey: 'change_mgmt.l2',
      level: 2,
      text: 'Определён (возможно, в виде рабочих документов) полный перечень ключевых изменений в ИТ-инфраструктуре, требующих согласования с подразделением ИБ. Определены маршруты, приоритеты согласования изменений.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 3
    {
      id: 's07.chg.l3.q1',
      sectionKey: 'change_mgmt',
      categoryKey: 'change_mgmt.l3',
      level: 3,
      text: 'Регламентирован процесс управления изменениями в ИТ-инфраструктуре, определено участие подразделения ИБ в процессе.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's07.chg.l3.q2',
      sectionKey: 'change_mgmt',
      categoryKey: 'change_mgmt.l3',
      level: 3,
      text: 'Ведётся реестр ключевых изменений с отображением затронутых активов и инициаторов изменений.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's07.chg.l3.q3',
      sectionKey: 'change_mgmt',
      categoryKey: 'change_mgmt.l3',
      level: 3,
      text: 'Используется автоматизированная система для обработки и согласования заявок на изменения. Все изменения регистрируются в системе.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's07.chg.l3.q4',
      sectionKey: 'change_mgmt',
      categoryKey: 'change_mgmt.l3',
      level: 3,
      text: 'Для изменений в ИТ-инфраструктуре регистрируется «карточка» включающая: критичность/степень влияния изменения; перечень затрагиваемых ИТ-активов; ответственных за вносимые изменения; уведомляемых об изменениях лиц; сценарии отката изменения.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 4
    {
      id: 's07.chg.l4.q1',
      sectionKey: 'change_mgmt',
      categoryKey: 'change_mgmt.l4',
      level: 4,
      text: 'Сформирован комитет по управлению ключевыми изменениями в ИТ-инфраструктуре компании. Подразделение ИБ — в составе комитета.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 5
    {
      id: 's07.chg.l5.q1',
      sectionKey: 'change_mgmt',
      categoryKey: 'change_mgmt.l5',
      level: 5,
      text: 'Сформирована единая система управления изменениями в компании с отслеживанием влияния изменений на бизнес-процессы, процессы ИТ и ИБ.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
  ],
};

export default SECTION_07_CHANGE_MGMT;
