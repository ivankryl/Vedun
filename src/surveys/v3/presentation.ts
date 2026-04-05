// src/surveys/v3/presentation.ts

export type PresentationBlock =
  | { type: 'header'; text: string }
  | { type: 'footer'; text: string }
  | { type: 'text'; text: string };

export type QuestionGroupRule =
  | {
      type: 'byCategoryKey';
      groups: Array<{
        key: string;
        title: string;
        categoryKeys: string[];
      }>;
    }
  | {
      type: 'byQuestionId';
      groups: Array<{
        key: string;
        title: string;
        questionIds: string[];
      }>;
    };

export type PresentationSubsection = {
  key: string;
  title: string;
  /** какие "технические" section.key попадают в этот подраздел */
  sectionKeys: string[];
  /** опционально: как разбивать вопросы внутри */
  questionGrouping?: QuestionGroupRule;
  blocks?: PresentationBlock[];
};

export type PresentationSection = {
  key: string; // например 'orig.2'
  title: string; // например 'ДОМЕН 2. Организационная структура'
  /** какие "технические" section.key попадают в эту секцию (если не используете subsections) */
  sectionKeys?: string[];
  subsections?: PresentationSubsection[];
  blocks?: PresentationBlock[];
};

const ATTESTATION_TEXT =
  'В настоящем заявлении‑опроснике Заявителем указаны сведения, являющиеся достоверными и соответствующими действительности. ' +
  'Заявитель согласен с тем, что при заключении договора страхования настоящее заявление‑опросник становится неотъемлемой частью договора (полиса) страхования. ' +
  'Заявитель обязуется сообщать страховой компании обо всех изменениях в заявленной информации, независимо от того, произошло это до или после начала действия договора (полиса) страхования. ' +
  'Если после заключения договора страхования будет установлено, что Заявитель (после заключения договора страхования — Страхователь) заявил изначально ложные и недостоверные сведения, страховая компания оставляет за собой право применить санкции, предусмотренные ст. 944 Гражданского кодекса Российской Федерации. ' +
  'Подписание настоящего заявления‑опросника не является обязательством Заявителя заключить договор страхования.';

export const SURVEY_V3_PRESENTATION: {
  version: 'v3';
  sections: PresentationSection[];
} = {
  version: 'v3',
  sections: [
    // 16 доменов (orig.1..orig.16), каждый — отдельная страница
    // ВАЖНО: sectionKeys приведены к ключам processBySection (см. gating.ts),
    // чтобы resolveProcessKey находил соответствие без префиксов sNN.
    {
      key: 'orig.1',
      title: 'ДОМЕН 1. Организационная структура',
      sectionKeys: ['org_structure'],
    },
    {
      key: 'orig.2',
      title: 'ДОМЕН 2. Управление ИТ-активами',
      sectionKeys: ['it_asset_mgmt'],
    },
    {
      key: 'orig.3',
      title: 'ДОМЕН 3. Риск-ориентированный подход и внутренний контроль',
      sectionKeys: ['risk_based'],
    },
    {
      key: 'orig.4',
      title: 'ДОМЕН 4. Архитектура безопасности',
      sectionKeys: ['security_architecture'],
    },
    {
      key: 'orig.5',
      title: 'ДОМЕН 5. Стратегия информационной безопасности',
      sectionKeys: ['security_strategy'],
    },
    {
      key: 'orig.6',
      title: 'ДОМЕН 6. Отчетность и метрики по ИБ',
      sectionKeys: ['reporting_metrics'],
    },
    {
      key: 'orig.7',
      title: 'ДОМЕН 7. Управление изменениями',
      sectionKeys: ['change_mgmt'],
    },
    {
      key: 'orig.8',
      title: 'ДОМЕН 8. Управление доступом',
      sectionKeys: ['access_mgmt'],
    },
    {
      key: 'orig.9',
      title: 'ДОМЕН 9. Сетевая безопасность',
      sectionKeys: ['network_security'],
    },
    {
      key: 'orig.10',
      title: 'ДОМЕН 10. Безопасность конечных устройств',
      sectionKeys: ['endpoint_security'],
    },
    {
      key: 'orig.11',
      title: 'ДОМЕН 11. Безопасность данных',
      sectionKeys: ['data_security'],
    },
    {
      key: 'orig.12',
      title: 'ДОМЕН 12. Мониторинг безопасности',
      sectionKeys: ['security_monitoring'],
    },
    {
      key: 'orig.13',
      title: 'ДОМЕН 13. Управление уязвимостями',
      sectionKeys: ['vulnerability_mgmt'],
    },
    {
      key: 'orig.14',
      title: 'ДОМЕН 14. Тесты на проникновение',
      sectionKeys: ['pentesting'],
    },
    {
      key: 'orig.15',
      title: 'ДОМЕН 15. Управление инцидентами ИБ',
      sectionKeys: ['incident_mgmt'],
    },
    {
      key: 'orig.16',
      title: 'ДОМЕН 16. Культура и осведомлённость по ИБ',
      sectionKeys: ['security_culture'],
    },

    // Финальная страница (99-я секция)
    {
      key: 'final.1',
      title: 'Подтверждение сведений и подпись',
      blocks: [{ type: 'text', text: ATTESTATION_TEXT }],
      sectionKeys: ['open_notes_attachments'], // 99-я секция
    },
  ],
};
