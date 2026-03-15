// src/surveys/v2/sections/08_it_service_providers.ts
import type { Section } from '../types'

export const SECTION_08_IT_SERVICE_PROVIDERS: Section = {
  key: 'it_service_providers',
  title: 'Поставщики (подрядчики) IT-услуг',
  description: 'Перечень подрядчиков и наличие доступа к ИТ-системам страхователя.',
  order: 9,
  questions: [
    {
      id: 's08.01.providers_table',
      sectionKey: 'it_service_providers',
      categoryKey: 'third_party.providers',
      text: 'Список подрядчиков IT-услуг',
      answerType: 'table',
      validation: { required: false },
      fields: [
        {
          id: 'name',
          label: 'Название подрядчика',
          type: 'text',
          validation: { required: true, minLength: 2, maxLength: 200 },
        },
        {
          id: 'product',
          label: 'Поставляемый продукт',
          type: 'text',
          validation: { required: true, minLength: 2, maxLength: 200 },
        },
        {
          id: 'hasAccess',
          label: 'Наличие доступа к IT системе страхователя',
          type: 'radio',
          validation: { required: true },
          options: [
            { id: 'yes', label: 'ДА', points: 0, weight: 1 }, // риск
            { id: 'no', label: 'НЕТ', points: 1, weight: 0 }, // лучше
          ],
        },
      ],
      ui: {
        minRows: 0,
        maxRows: 50,
        addRowLabel: 'Добавить подрядчика',
      },
    },
  ],
}
