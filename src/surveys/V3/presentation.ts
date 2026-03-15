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
  sectionKeys: string[];
  questionGrouping?: QuestionGroupRule;
  blocks?: PresentationBlock[];
};

export type PresentationSection = {
  key: string; // например 'orig.2'
  title: string; // например 'СЕКЦИЯ 2. ...'
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
      title: 'СЕКЦИЯ 1. Общая информация',
      sectionKeys: ['general'], // Уточните фактический ключ из SECTION_00_GENERAL
    },
    {
      key: 'orig.2',
      title: 'СЕКЦИЯ 2. Организация и стратегия',
      sectionKeys: [
        'org_structure',
        'it_asset_mgmt',
        'risk_based',
        'security_architecture',
        'security_strategy',
        'reporting_metrics',
      ],
    },
    {
      key: 'orig.3',
      title: 'СЕКЦИЯ 3. Процессы и доступ',
      sectionKeys: ['change_mgmt', 'access_mgmt'],
    },
    {
      key: 'orig.4',
      title: 'СЕКЦИЯ 4. Сеть и конечные устройства',
      sectionKeys: ['network_security', 'endpoint_security'],
    },
    {
      key: 'orig.5',
      title: 'СЕКЦИЯ 5. Данные и мониторинг',
      sectionKeys: ['data_security', 'security_monitoring'],
    },
    {
      key: 'orig.6',
      title: 'СЕКЦИЯ 6. Уязвимости и тестирование',
      sectionKeys: ['vulnerability_mgmt', 'pentesting'],
    },
    {
      key: 'orig.7',
      title: 'СЕКЦИЯ 7. Инциденты и культура',
      sectionKeys: ['incident_mgmt', 'security_culture'],
    },
    // Если в v3 нужна отдельная "финансовая" секция — добавьте здесь orig.8
    {
      key: 'orig.8',
      title: 'СЕКЦИЯ 8. Итоги',
      blocks: [{ type: 'text', text: 'Проверьте ответы перед подтверждением.' }],
    },
    {
      key: 'final.1',
      title: 'Подтверждение сведений и подпись',
      blocks: [{ type: 'text', text: ATTESTATION_TEXT }],
      sectionKeys: ['open_notes_attachments'], // из SECTION_99_OPEN_NOTES_ATTACHMENTS
    },
  ],
};

export default SURVEY_V3_PRESENTATION;
