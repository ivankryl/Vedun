// src/surveys/v1/sections/13_network_infrastructure.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

export const SECTION_13_NETWORK_INFRASTRUCTURE: Section = {
  key: 'network_infrastructure',
  title: 'Сетевая инфраструктура и периметр (Network)',
  description: 'Схема сети, сегментация (VLAN), DMZ, пересмотр правил МЭ, беспроводной доступ.',
  order: 14,
  questions: [
    {
      id: 's13.01.network_architecture_diagram_up_to_date',
      sectionKey: 'network_infrastructure',
      categoryKey: 'network.architecture',
      text: 'Описана и поддерживается ли в актуальном состоянии схема сетевой архитектуры компании?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's13.02.vlan_segmentation',
      sectionKey: 'network_infrastructure',
      categoryKey: 'network.segmentation',
      text: 'Осуществлено ли сегментирование локальной сети компании (VLAN)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's13.03.dmz_exists',
      sectionKey: 'network_infrastructure',
      categoryKey: 'network.segmentation',
      text: 'Выделены ли в сетевой архитектуре демилитаризованные зоны (DMZ)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's13.04.firewall_rules_review',
      sectionKey: 'network_infrastructure',
      categoryKey: 'network.controls',
      text: 'Регулярно ли проводится пересмотр конфигурации межсетевых экранов и правил фильтрации?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },

    {
      id: 's13.05.wifi_restricted_locations',
      sectionKey: 'network_infrastructure',
      categoryKey: 'network.wireless',
      text: 'Обеспечено ли использование в компании технологии беспроводного доступа только в разрешенных локациях/объектах?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's13.06.wifi_auth_methods',
      sectionKey: 'network_infrastructure',
      categoryKey: 'network.wireless',
      text: 'Какие методы идентификации и аутентификации пользователей беспроводного доступа используются в компании?',
      answerType: 'text',
      validation: { required: false, maxLength: 1000 },
      visibleIf: { questionId: 's13.05.wifi_restricted_locations', op: 'equals', value: 'yes' },
    },
  ],
}
