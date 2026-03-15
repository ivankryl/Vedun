// src/surveys/v2/sections/16_iam_access_remote.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

const YES_NO_RISK: Option[] = [
  // "ДА" = риск (например используют личный ноутбук) -> хуже
  { id: 'yes', label: 'ДА', points: 0, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 1, weight: 0 },
]

export const SECTION_16_IAM_ACCESS_REMOTE: Section = {
  key: 'iam_access_remote',
  title: 'Управление доступом и удалённая работа (IAM/Remote)',
  description: 'Управление доступом, принцип наименьших привилегий, парольная политика, удалённый доступ и устройства.',
  order: 17,
  questions: [
    {
      id: 's16.01.user_access_management_process',
      sectionKey: 'iam_access_remote',
      categoryKey: 'iam.process',
      text: 'Пожалуйста, опишите процесс управления доступом пользователей',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
    },
    {
      id: 's16.02.least_privilege',
      sectionKey: 'iam_access_remote',
      categoryKey: 'iam.controls',
      text: 'Применяются ли принципы наименьших полномочий (привилегий) и разграничения доступа?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },

    {
      id: 's16.03.password_policy_length',
      sectionKey: 'iam_access_remote',
      categoryKey: 'iam.passwords',
      text: 'Какая парольная политика принята (минимальное количество символов)?',
      answerType: 'number',
      validation: { required: false, min: 1, max: 256 },
      unit: 'символов',
    },
    {
      id: 's16.04.password_change_frequency',
      sectionKey: 'iam_access_remote',
      categoryKey: 'iam.passwords',
      text: 'Как часто обновляются пароли?',
      answerType: 'text',
      validation: { required: false, maxLength: 100 },
    },
    {
      id: 's16.05.password_storage',
      sectionKey: 'iam_access_remote',
      categoryKey: 'iam.passwords',
      text: 'Пароли хранятся в открытом виде или в хешированном?',
      answerType: 'select',
      validation: { required: false },
      options: [
        { id: 'hashed', label: 'В хешированном виде', points: 1, weight: 1 },
        { id: 'encrypted', label: 'В зашифрованном виде', points: 0.7, weight: 0.7 },
        { id: 'plaintext', label: 'В открытом виде', points: 0, weight: 1 },
        { id: 'unknown', label: 'Неизвестно', points: 0, weight: 0.5 },
      ],
      isRisk: true,
    },

    {
      id: 's16.06.remote_access_provided',
      sectionKey: 'iam_access_remote',
      categoryKey: 'endpoint.remote',
      text: 'Предоставляется ли сотрудникам удаленный доступ к информационной системе?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's16.07.company_laptop_provided',
      sectionKey: 'iam_access_remote',
      categoryKey: 'endpoint.remote',
      text: 'Предоставляется ли сотрудникам рабочий ноутбук для удаленной работы?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's16.08.personal_laptop_used',
      sectionKey: 'iam_access_remote',
      categoryKey: 'endpoint.remote',
      text: 'Используют ли сотрудники личный ноутбук для удаленного доступа?',
      answerType: 'radio',
      validation: { required: false },
      options: YES_NO_RISK,
      isRisk: true,
      visibleIf: { questionId: 's16.06.remote_access_provided', op: 'equals', value: 'yes' },
    },
    {
      id: 's16.09.personal_device_malware_check',
      sectionKey: 'iam_access_remote',
      categoryKey: 'endpoint.remote',
      text: 'Если используется личный ноутбук, проходит ли он проверку на наличие вредоносного ПО?',
      answerType: 'radio',
      validation: { required: false },
      options: YES_NO_POSITIVE,
      visibleIf: { questionId: 's16.08.personal_laptop_used', op: 'equals', value: 'yes' },
    },
  ],
}

