// src/surveys/v3/insurer_ui.ts
import type { SurveyTemplateVersion } from './types';
import { SURVEY_TEMPLATE_V3 } from './index';
import { SURVEY_V3_PRESENTATION } from './presentation';

/**
 * UI-конфиг для "страхователя" (wizard, 19 экранов)
 * - cover (титул)
 * - 16 секций (orig.1..orig.16 — Домены ИБ)
 * - финальная секция (final.1 — 99-я: юртекст/вложения/согласие/подпись)
 * - result
 */

export type InsurerUiAsset =
  | { kind: 'staticPublicUrl'; url: string }
  | { kind: 'frontAssetKey'; key: string };

export type InsurerUiBlock =
  | { type: 'titleRow'; leftText: string; rightLogo?: InsurerUiAsset }
  | { type: 'subtitle'; text: string }
  | { type: 'divider' }
  | { type: 'text'; text: string };

export type InsurerUiProgress =
  | { mode: 'pages' } // равный вес каждой страницы
  | { mode: 'questions' }; // процент по отвеченным обязательным вопросам

export type InsurerUiPrefill =
  | {
      type: 'fromInsureeCard';
      fields: Array<
        | { questionId: string; path: 'contactName' }
        | { questionId: string; path: 'contactEmail' }
        | { questionId: string; path: 'contactPosition' }
        | { questionId: string; path: 'phone' }
      >;
    };

export type InsurerUiPage =
  | {
      key: 'cover';
      kind: 'cover';
      title: string;
      blocks: InsurerUiBlock[];
      primaryActionLabel?: string;
    }
  | {
      key: string;
      kind: 'section';
      /** ссылка на presentation.section.key (orig.1..orig.16, final.1) */
      presentationSectionKey: string;
      titleOverride?: string;
      blocksTop?: InsurerUiBlock[];
      blocksBottom?: InsurerUiBlock[];
      prefill?: InsurerUiPrefill[];
    }
  | {
      key: 'result';
      kind: 'result';
      title: string;
      blocksTop?: InsurerUiBlock[];
    };

export type InsurerSurveyUi = {
  version: SurveyTemplateVersion;
  templateTitle: string;
  progress: InsurerUiProgress;
  header: {
    /** общий хэдер для всех страниц wizard (кроме cover — там свой) */
    blocks: InsurerUiBlock[];
  };
  pages: InsurerUiPage[];
  /**
   * Для фронта: быстрый доступ к данным (чтобы не импортировать отдельно)
   * Можно удалить, если фронт уже получает template/presentation по API.
   */
  data: {
    template: typeof SURVEY_TEMPLATE_V3;
    presentation: typeof SURVEY_V3_PRESENTATION;
  };
};

const HEADER_BLOCKS: InsurerUiBlock[] = [
  {
    type: 'titleRow',
    leftText: 'ОПРОСНИК',
    rightLogo: { kind: 'frontAssetKey', key: 'elbrus-logo' },
  },
  { type: 'subtitle', text: 'на определение уровня зрелости процессов обеспечения ИБ' },
  { type: 'divider' },
];

export const INSURER_SURVEY_UI_V3: InsurerSurveyUi = {
  version: 'v3',
  templateTitle: SURVEY_TEMPLATE_V3.title,

  // Более точный прогресс — по обязательным вопросам.
  progress: { mode: 'questions' },

  header: {
    blocks: HEADER_BLOCKS,
  },

  pages: [
    // 0) Титул
    {
      key: 'cover',
      kind: 'cover',
      title: 'Опросник',
      blocks: [
        {
          type: 'titleRow',
          leftText: 'ОПРОСНИК',
          rightLogo: { kind: 'frontAssetKey', key: 'elbrus-logo' },
        },
        { type: 'subtitle', text: 'на определение уровня зрелости процессов обеспечения ИБ' },
        { type: 'divider' },
        {
          type: 'text',
          text: 'Пожалуйста, заполните опросник. Вы сможете вернуться к предыдущим разделам в любой момент.',
        },
      ],
      primaryActionLabel: 'Начать',
    },

    // 1..16) Домены ИБ (orig.1..orig.16 из presentation.ts)
    { key: 'section-1', kind: 'section', presentationSectionKey: 'orig.1' },
    { key: 'section-2', kind: 'section', presentationSectionKey: 'orig.2' },
    { key: 'section-3', kind: 'section', presentationSectionKey: 'orig.3' },
    { key: 'section-4', kind: 'section', presentationSectionKey: 'orig.4' },
    { key: 'section-5', kind: 'section', presentationSectionKey: 'orig.5' },
    { key: 'section-6', kind: 'section', presentationSectionKey: 'orig.6' },
    { key: 'section-7', kind: 'section', presentationSectionKey: 'orig.7' },
    { key: 'section-8', kind: 'section', presentationSectionKey: 'orig.8' },
    { key: 'section-9', kind: 'section', presentationSectionKey: 'orig.9' },
    { key: 'section-10', kind: 'section', presentationSectionKey: 'orig.10' },
    { key: 'section-11', kind: 'section', presentationSectionKey: 'orig.11' },
    { key: 'section-12', kind: 'section', presentationSectionKey: 'orig.12' },
    { key: 'section-13', kind: 'section', presentationSectionKey: 'orig.13' },
    { key: 'section-14', kind: 'section', presentationSectionKey: 'orig.14' },
    { key: 'section-15', kind: 'section', presentationSectionKey: 'orig.15' },
    { key: 'section-16', kind: 'section', presentationSectionKey: 'orig.16' },

    // 17) Финальная страница (final.1 — секция 99)
    {
      key: 'final',
      kind: 'section',
      presentationSectionKey: 'final.1',
      prefill: [
        {
          type: 'fromInsureeCard',
          fields: [
            // префилл подписанта и контактных данных в новые id v3 (секция 99)
            { questionId: 's99.91.signer_name', path: 'contactName' },
            { questionId: 's99.92.signer_position', path: 'contactPosition' },

            // контакт для уточнений (разнесён на отдельные вопросы)
            // ВАЖНО: проверьте соответствие с template/presentation.
            { questionId: 's99.03.contact_email', path: 'contactEmail' },
            { questionId: 's99.04.contact_phone', path: 'phone' },
          ],
        },
      ],
    },

    // 18) Результат/отправка
    {
      key: 'result',
      kind: 'result',
      title: 'Результат',
      blocksTop: [
        { type: 'text', text: 'Спасибо! Опросник заполнен. Вы можете отправить ответы брокеру/страховщику.' },
      ],
    },
  ],

  data: {
    template: SURVEY_TEMPLATE_V3,
    presentation: SURVEY_V3_PRESENTATION,
  },
};

export default INSURER_SURVEY_UI_V3;
