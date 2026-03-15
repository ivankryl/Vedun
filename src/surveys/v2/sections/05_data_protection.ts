// src/surveys/v2/sections/05_data_protection.ts
import type { Section } from '../types'

const YES_NO = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
] as const

export const SECTION_05_DATA_PROTECTION: Section = {
  key: 'data_protection_systems',
  title: 'Управление рисками и внутренний контроль — Защита данных',
  order: 6,
  questions: [
    {
      id: 's05.01.dlp',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data',
      text: 'DLP — Системы предотвращения утечек данных',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO],
    },
    {
      id: 's05.02.dlp_vendor',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data.vendor',
      text: 'Вендор/решение для DLP (если есть)',
      answerType: 'text',
    },

    {
      id: 's05.03.dag',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data',
      text: 'DAG — Управление доступом к данным',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO],
    },
    {
      id: 's05.04.dag_vendor',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data.vendor',
      text: 'Вендор/решение для DAG (если есть)',
      answerType: 'text',
    },

    {
      id: 's05.05.dcap',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data',
      text: 'DCAP — Контроль доступа к данным и аналитика их использования',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO],
    },
    {
      id: 's05.06.dcap_vendor',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data.vendor',
      text: 'Вендор/решение для DCAP (если есть)',
      answerType: 'text',
    },

    {
      id: 's05.07.dbf',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data',
      text: 'DBF — Защита базы данных',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO],
    },
    {
      id: 's05.08.dbf_vendor',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data.vendor',
      text: 'Вендор/решение для DBF (если есть)',
      answerType: 'text',
    },

    {
      id: 's05.09.vdr',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data',
      text: 'VDR — Виртуальная комната данных для безопасного обмена документами',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO],
    },
    {
      id: 's05.10.vdr_vendor',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data.vendor',
      text: 'Вендор/решение для VDR (если есть)',
      answerType: 'text',
    },

    {
      id: 's05.11.mdm',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data',
      text: 'MDM — Управление мобильными устройствами',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO],
    },
    {
      id: 's05.12.mdm_vendor',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data.vendor',
      text: 'Вендор/решение для MDM (если есть)',
      answerType: 'text',
    },

    {
      id: 's05.13.data_other',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data',
      text: 'Иные решения (защита данных) — используются?',
      answerType: 'radio',
      validation: { required: true },
      options: [...YES_NO],
    },
    {
      id: 's05.14.data_other_vendor',
      sectionKey: 'data_protection_systems',
      categoryKey: 'controls.data.vendor',
      text: 'Какие именно “иные решения” (вендор/продукт)',
      answerType: 'text',
    },
  ],
}
