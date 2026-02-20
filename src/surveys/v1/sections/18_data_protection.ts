// src/surveys/v1/sections/18_data_protection.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

export const SECTION_18_DATA_PROTECTION: Section = {
  key: 'data_protection',
  title: 'Защита данных (Data Protection)',
  description: 'Классификация данных, шифрование, управление ключами, DLP, журналирование.',
  order: 19,
  questions: [
    {
      id: 's18.01.data_classification_exists',
      sectionKey: 'data_protection',
      categoryKey: 'data.classification',
      text: 'Разработана ли и внедрена классификация данных?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's18.02.encryption_at_rest',
      sectionKey: 'data_protection',
      categoryKey: 'data.encryption',
      text: 'Используется ли шифрование данных “at rest” (на дисках/в БД/хранилищах)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's18.03.encryption_in_transit',
      sectionKey: 'data_protection',
      categoryKey: 'data.encryption',
      text: 'Используется ли шифрование данных “in transit” (в каналах передачи, TLS и т.п.)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's18.04.key_management_process',
      sectionKey: 'data_protection',
      categoryKey: 'data.keys',
      text: 'Опишите как организовано управление ключами шифрования (KMS/HSM, ротация, доступы).',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
    },
    {
      id: 's18.05.dlp_used',
      sectionKey: 'data_protection',
      categoryKey: 'data.dlp',
      text: 'Используются ли средства предотвращения утечек данных (DLP)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's18.06.dlp_scope',
      sectionKey: 'data_protection',
      categoryKey: 'data.dlp',
      text: 'Если да — где применяются DLP и какие каналы/сценарии покрываются?',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
      visibleIf: { questionId: 's18.05.dlp_used', op: 'equals', value: 'yes' },
    },
    {
      id: 's18.07.security_logging_exists',
      sectionKey: 'data_protection',
      categoryKey: 'logging.security',
      text: 'Ведется ли журналирование событий информационной безопасности (security logs)?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's18.08.log_retention_period',
      sectionKey: 'data_protection',
      categoryKey: 'logging.security',
      text: 'Срок хранения логов (например, 30/90/180/365 дней)',
      answerType: 'text',
      validation: { required: false, maxLength: 50 },
    },
  ],
}
