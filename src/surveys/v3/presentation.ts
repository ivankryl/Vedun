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
  title: string; // например 'СЕКЦИЯ 2. Организационная структура'
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
    {
      key: 'orig.1',
      title: 'СЕКЦИЯ 1. Общая информация о Заявителе (Страхователе)',
      sectionKeys: ['00_general'],
    },
    {
      key: 'orig.2',
      title: 'СЕКЦИЯ 2. Организационная структура',
      sectionKeys: ['01_org_structure'],
    },
    {
      key: 'orig.3',
      title: 'СЕКЦИЯ 3. Управление ИТ-активами',
      sectionKeys: ['02_it_asset_mgmt'],
    },
    {
      key: 'orig.4',
      title: 'СЕКЦИЯ 4. Риск-ориентированный подход и внутренний контроль',
      sectionKeys: ['03_risk_based'],
    },
    {
      key: 'orig.5',
      title: 'СЕКЦИЯ 5. Архитектура безопасности',
      sectionKeys: ['04_security_architecture'],
    },
    {
      key: 'orig.6',
      title: 'СЕКЦИЯ 6. Стратегия и управление безопасностью',
      sectionKeys: ['05_security_strategy'],
    },
    {
      key: 'orig.7',
      title: 'СЕКЦИЯ 7. Отчетность по ИБ и управление изменениями',
      subsections: [
        {
          key: 'orig.7.reporting',
          title: 'Отчетность и метрики',
          sectionKeys: ['06_reporting_metrics'],
        },
        {
          key: 'orig.7.change',
          title: 'Управление изменениями',
          sectionKeys: ['07_change_mgmt'],
        },
      ],
    },
    {
      key: 'orig.8',
      title: 'СЕКЦИЯ 8. Практики безопасности и операционные процессы',
      subsections: [
        {
          key: 'orig.8.access',
          title: 'Управление доступом',
          sectionKeys: ['08_access_mgmt'],
        },
        {
          key: 'orig.8.network',
          title: 'Сетевая безопасность',
          sectionKeys: ['09_network_security'],
        },
        {
          key: 'orig.8.endpoint',
          title: 'Защита конечных точек',
          sectionKeys: ['10_endpoint_security'],
        },
        {
          key: 'orig.8.data',
          title: 'Безопасность данных',
          sectionKeys: ['11_data_security'],
        },
        {
          key: 'orig.8.monitoring',
          title: 'Мониторинг безопасности',
          sectionKeys: ['12_security_monitoring'],
        },
        {
          key: 'orig.8.vuln',
          title: 'Управление уязвимостями и AppSec',
          sectionKeys: ['13_vulnerability_mgmt'],
        },
        {
          key: 'orig.8.pentest',
          title: 'Тесты на проникновение',
          sectionKeys: ['14_pentesting'],
        },
        {
          key: 'orig.8.incidents',
          title: 'Управление инцидентами',
          sectionKeys: ['15_incident_mgmt'],
        },
        {
          key: 'orig.8.culture',
          title: 'Культура и осведомленность по ИБ',
          sectionKeys: ['16_security_culture'],
        },
      ],
    },
    {
      key: 'final.1',
      title: 'Подтверждение сведений и подпись',
      blocks: [{ type: 'text', text: ATTESTATION_TEXT }],
      sectionKeys: ['open_notes_attachments'], // 99-я секция
    },
  ],
};
