// src/surveys/v2/presentation.ts
export type PresentationBlock =
  | { type: 'header'; text: string }
  | { type: 'footer'; text: string }
  | { type: 'text'; text: string }

export type QuestionGroupRule =
  | {
      type: 'byCategoryKey'
      /** порядок вывода групп */
      groups: Array<{
        key: string
        title: string
        categoryKeys: string[]
      }>
    }
  | {
      type: 'byQuestionId'
      groups: Array<{
        key: string
        title: string
        questionIds: string[]
      }>
    }

export type PresentationSubsection = {
  key: string
  title: string
  /** какие "технические" section.key попадают в этот подраздел */
  sectionKeys: string[]
  /** опционально: как разбивать вопросы внутри */
  questionGrouping?: QuestionGroupRule
  blocks?: PresentationBlock[]
}

export type PresentationSection = {
  key: string // например 'orig.2'
  title: string // например 'СЕКЦИЯ 2. Страховая защита'
  /** какие "технические" section.key попадают в эту секцию (если не используете subsections) */
  sectionKeys?: string[]
  subsections?: PresentationSubsection[]
  blocks?: PresentationBlock[]
}

const ATTESTATION_TEXT =
  'В настоящем заявлении-вопроснике, заявителем указаны данные достоверные и отвечающие действительности. ' +
  'Заявитель согласен с тем, что при заключении договора страхования настоящее заявление-вопросник становится ' +
  'неотъемлемой частью договора (полиса) страхования. Заявитель обязуется сообщать страховой компании обо всех ' +
  'изменениях в заявленной информации вне зависимости от того, произошло это до или после начала действия договора ' +
  '(полиса) страхования. Если, после заключения договора страхования будет установлено, что Заявитель ' +
  '(после заключения договора страхования – Страхователь) заявил изначально ложные и недостоверные данные, страховая ' +
  'компания оставляет за собой право применить санкции, предусмотренные ст. 944 Гражданского Кодекса Российской Федерации. ' +
  'Подписание настоящего заявления-вопросника не является обязательством Заявителя заключить договор страхования.'

export const SURVEY_V2_PRESENTATION: {
  version: 'v2'
  sections: PresentationSection[]
} = {
  version: 'v2',
  sections: [
    {
      key: 'orig.1',
      title: 'СЕКЦИЯ 1. Общая информация о Заявителе (Страхователе)',
      sectionKeys: ['general'],
    },

    {
      key: 'orig.2',
      title: 'СЕКЦИЯ 2. Страховая защита',
      blocks: [
        // сюда можно добавить любой “титульный” текст/пояснения как в образце
        // { type: 'text', text: 'предоставить детали ...' },
      ],
      subsections: [
        {
          key: 'orig.2.risks',
          title: 'Риски',
          sectionKeys: ['insurance_protection'],
          questionGrouping: {
            type: 'byCategoryKey',
            groups: [
              {
                key: 'risks',
                title: 'Риски',
                categoryKeys: ['insurance.risks'],
              },
            ],
          },
        },
        {
          key: 'orig.2.impacts',
          title: 'Последствия реализации рисков',
          sectionKeys: ['insurance_protection'],
          questionGrouping: {
            type: 'byCategoryKey',
            groups: [
              {
                key: 'impacts',
                title: 'Последствия реализации рисков',
                categoryKeys: ['insurance.impacts'],
              },
              {
                key: 'liability',
                title: 'Ответственность перед третьими лицами',
                categoryKeys: ['insurance.liability'],
              },
              {
                key: 'costs',
                title: 'Расходы',
                categoryKeys: ['insurance.costs'],
              },
            ],
          },
        },
      ],
    },

    {
      key: 'orig.3',
      title: 'СЕКЦИЯ 3. Штат ИТ/ИБ/MSP/MSSP',
      sectionKeys: ['it_ib_staff_msp_mssp'],
    },

    {
      key: 'orig.4',
      title: 'СЕКЦИЯ 4. Управление рисками и внутренний контроль',
      subsections: [
        {
          key: 'orig.4.access',
          title: 'Управление доступом',
          sectionKeys: ['access_management'],
        },
        {
          key: 'orig.4.network',
          title: 'Сетевая безопасность',
          sectionKeys: ['network_security'],
        },
        {
          key: 'orig.4.data',
          title: 'Защита данных',
          sectionKeys: ['data_protection_systems'],
        },
        {
          key: 'orig.4.endpoint',
          title: 'Защита конечных точек',
          sectionKeys: ['endpoint_protection'],
        },
        {
          key: 'orig.4.ops',
          title: 'Анализ, контроль и реагирование на угрозы ИБ',
          sectionKeys: ['security_ops_analytics'],
        },
      ],
    },

    {
      key: 'orig.5',
      title: 'СЕКЦИЯ 5. Поставщики (Подрядчики) IT-услуг',
      sectionKeys: ['it_service_providers'],
    },

    {
      key: 'orig.6',
      title: 'СЕКЦИЯ 6. Результативная кибербезопасность',
      sectionKeys: ['effective_cybersecurity'],
    },

    {
      key: 'orig.7',
      title: 'СЕКЦИЯ 7. Общие вопросы по практикам и политике ИБ',
      sectionKeys: [
        'governance_program',
        'secops_incident_threat_intel',
        'resilience_continuity',
        'network_infrastructure',
        'people_awareness',
        'cloud_security',
        'iam_access_remote',
        'privacy_risk_inventory',
        'data_protection', // если у вас ключ другой — подставим фактический
        'vulnerability_appsec',
        'third_party_supply_chain',
        'incident_response_monitoring',
        'physical_security',
        'hr_security_training',
        'compliance_audit_certifications',
        // ВАЖНО: open_notes_attachments больше не часть секции 7 — это финальная страница
      ],
    },

    {
      key: 'orig.8',
      title: 'СЕКЦИЯ 8. Финансовые показатели',
      sectionKeys: ['financial_metrics'],
    },

    // Финальная страница (после финансов): доп.материалы + согласие/подпись
    {
      key: 'final.1',
      title: 'Подтверждение сведений и подпись',
      blocks: [{ type: 'text', text: ATTESTATION_TEXT }],
      sectionKeys: ['open_notes_attachments'],
    },
  ],
}
