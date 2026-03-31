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
  'В настоящем заявлении-вопроснике, заявителем указаны данные достоверные и отвечающие действительности. ' +
  'Заявитель согласен с тем, что при заключении договора страхования настоящее заявление-вопросник становится ' +
  'неотъемлемой частью договора (полиса) страхования. Заявитель обязуется сообщать страховой компании обо всех ' +
  'изменениях в заявленной информации вне зависимости от того, произошло это до или после начала действия договора ' +
  '(полиса) страхования. Если, после заключения договора страхования будет установлено, что Заявитель ' +
  '(после заключения договора страхования – Страхователь) заявил изначально ложные и недостоверные данные, страховая ' +
  'компания оставляет за собой право применить санкции, предусмотренные ст. 944 Гражданского Кодекса Российской Федерации. ' +
  'Подписание настоящего заявления-вопросника не является обязательством Заявителя заключить договор страхования.';

export const SURVEY_V3_PRESENTATION: {
  version: 'v3';
  sections: PresentationSection[];
} = {
  version: 'v3',
  sections: [
    // 16 доменов (orig.1..orig.16), каждый — отдельная страница
    {
      key: 'orig.1',
      title: 'ДОМЕН 1. Организационная структура',
      sectionKeys: ['01_org_structure'],
    },
    {
      key: 'orig.2',
      title: 'ДОМЕН 2. Управление ИТ-активами',
      sectionKeys: ['02_it_asset_mgmt'],
    },
    {
      key: 'orig.3',
      title: 'ДОМЕН 3. Риск-ориентированный подход и внутренний контроль',
      sectionKeys: ['03_risk_based'],
    },
    {
      key: 'orig.4',
      title: 'ДОМЕН 4. Архитектура безопасности',
      sectionKeys: ['04_security_architecture'],
    },
    {
      key: 'orig.5',
      title: 'ДОМЕН 5. Стратегия информационной безопасности',
      sectionKeys: ['05_security_strategy'],
    },
    {
      key: 'orig.6',
      title: 'ДОМЕН 6. Отчетность и метрики по ИБ',
      sectionKeys: ['06_reporting_metrics'],
    },
    {
      key: 'orig.7',
      title: 'ДОМЕН 7. Управление изменениями',
      sectionKeys: ['07_change_mgmt'],
    },
    {
      key: 'orig.8',
      title: 'ДОМЕН 8. Управление доступом',
      sectionKeys: ['08_access_mgmt'],
    },
    {
      key: 'orig.9',
      title: 'ДОМЕН 9. Сетевая безопасность',
      sectionKeys: ['09_network_security'],
    },
    {
      key: 'orig.10',
      title: 'ДОМЕН 10. Безопасность конечных устройств',
      sectionKeys: ['10_endpoint_security'],
    },
    {
      key: 'orig.11',
      title: 'ДОМЕН 11. Безопасность данных',
      sectionKeys: ['11_data_security'],
    },
    {
      key: 'orig.12',
      title: 'ДОМЕН 12. Мониторинг безопасности',
      sectionKeys: ['12_security_monitoring'],
    },
    {
      key: 'orig.13',
      title: 'ДОМЕН 13. Управление уязвимостями',
      sectionKeys: ['13_vulnerability_mgmt'],
    },
    {
      key: 'orig.14',
      title: 'ДОМЕН 14. Тесты на проникновение',
      sectionKeys: ['14_pentesting'],
    },
    {
      key: 'orig.15',
      title: 'ДОМЕН 15. Управление инцидентами ИБ',
      sectionKeys: ['15_incident_mgmt'],
    },
    {
      key: 'orig.16',
      title: 'ДОМЕН 16. Культура и осведомлённость по ИБ',
      sectionKeys: ['16_security_culture'],
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
