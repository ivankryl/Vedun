// src/surveys/v3/sections/05_security_strategy.ts
import type { Section } from '../types';

const YES_NO_NA_OPTIONS = [
  { id: 'yes', label: 'Да', points: 1, weight: 1 },
  { id: 'no', label: 'Нет', points: 0, weight: 1 },
  { id: 'na', label: 'Не применимо', points: 1, weight: 0 },
]as const;

export const SECTION_05_SECURITY_STRATEGY: Section = {
  key: 'security_strategy',
  title: 'Стратегия ИБ',
  description: 'Критерии по уровням зрелости (Да/Нет/НП).',
  order: 5,
  questions: [
    // Уровень 1
    {
      id: 's05.sstr.l1.q1',
      sectionKey: 'security_strategy',
      categoryKey: 'security_strategy.l1',
      level: 1,
      text: 'В компании выполняется планирование развития ИБ (возможно, не полностью формализовано).',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's05.sstr.l1.q2',
      sectionKey: 'security_strategy',
      categoryKey: 'security_strategy.l1',
      level: 1,
      text: 'Выделяются ресурсы на обеспечение ИБ, как минимум, на ФОТ и/или отдельные технические средства и услуги.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 2
    {
      id: 's05.sstr.l2.q1',
      sectionKey: 'security_strategy',
      categoryKey: 'security_strategy.l2',
      level: 2,
      text: 'План развития ИБ компании разработан и утверждён советом директоров (или эквивалентным органом управления).',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's05.sstr.l2.q2',
      sectionKey: 'security_strategy',
      categoryKey: 'security_strategy.l2',
      level: 2,
      text: 'Выделен бюджет на обеспечение и развитие ИБ, учитывающий все мероприятия плана развития ИБ (возможно, используются не ИБ-статьи расходов).',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's05.sstr.l2.q3',
      sectionKey: 'security_strategy',
      categoryKey: 'security_strategy.l2',
      level: 2,
      text: 'План развития ИБ регулярно обновляется при существенных изменениях в бизнесе и ландшафте угроз.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 3
    {
      id: 's05.sstr.l3.q1',
      sectionKey: 'security_strategy',
      categoryKey: 'security_strategy.l3',
      level: 3,
      text: 'План развития ИБ компании учитывает цели бизнеса и подразделения ИТ.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's05.sstr.l3.q2',
      sectionKey: 'security_strategy',
      categoryKey: 'security_strategy.l3',
      level: 3,
      text: 'Бюджет на ИБ является выделенным бюджетом подразделения и/или статьи расходов ИБ формально и фактически защищены (невозможно их расходование на задачи, не связанные с ИБ).',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's05.sstr.l3.q3',
      sectionKey: 'security_strategy',
      categoryKey: 'security_strategy.l3',
      level: 3,
      text: 'Разработана и утверждена стратегия ИБ, определяющая долгосрочные задачи и соответствующий план развития ИБ (на перспективу не менее двух лет).',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 4
    {
      id: 's05.sstr.l4.q1',
      sectionKey: 'security_strategy',
      categoryKey: 'security_strategy.l4',
      level: 4,
      text: 'Стратегия ИБ обновляется при существенных изменениях в стратегиях бизнеса и ИТ, в ландшафте угроз.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
    {
      id: 's05.sstr.l4.q2',
      sectionKey: 'security_strategy',
      categoryKey: 'security_strategy.l4',
      level: 4,
      text: 'Производится регулярная оценка эффективности реализации стратегии ИБ (как минимум ежегодно), план реализации стратегии корректируется (при необходимости).',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },

    // Уровень 5
    {
      id: 's05.sstr.l5.q1',
      sectionKey: 'security_strategy',
      categoryKey: 'security_strategy.l5',
      level: 5,
      text: 'Стратегическое планирование ИБ интегрировано с системой управления риском ИБ компании.',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO_NA_OPTIONS],
      weight: 1,
    },
  ],
};

export default SECTION_05_SECURITY_STRATEGY;
