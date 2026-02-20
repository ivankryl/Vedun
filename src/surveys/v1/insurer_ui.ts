// src/surveys/v1/insurer_ui.ts
import type { SurveyTemplateVersion } from './types'
import { SURVEY_TEMPLATE_V1 } from './index'
import { SURVEY_V1_PRESENTATION } from './presentation'

/**
 * UI-конфиг для "страхователя" (wizard, 10 экранов)
 * - cover (титул)
 * - 8 секций
 * - финальная секция (юртекст + доп.материалы + согласие/подпись из вопросов)
 * - result
 */

export type InsurerUiAsset =
  | { kind: 'staticPublicUrl'; url: string }
  | { kind: 'frontAssetKey'; key: string } // например, фронт сам мапит на /assets/elbrus-logo.png

export type InsurerUiBlock =
  | { type: 'titleRow'; leftText: string; rightLogo?: InsurerUiAsset }
  | { type: 'subtitle'; text: string }
  | { type: 'divider' }
  | { type: 'text'; text: string }

export type InsurerUiProgress =
  | { mode: 'pages' } // равный вес каждой страницы
  | { mode: 'questions' } // процент по отвеченным обязательным вопросам (сложнее, но точнее)

export type InsurerUiPrefill =
  | {
      type: 'fromInsureeCard'
      fields: Array<
        | { questionId: string; path: 'contactName' }
        | { questionId: string; path: 'contactEmail' }
        | { questionId: string; path: 'contactPosition' }
        | { questionId: string; path: 'phone' }
      >
    }


export type InsurerUiPage =
  | {
      key: 'cover'
      kind: 'cover'
      title: string
      blocks: InsurerUiBlock[]
      primaryActionLabel?: string
    }
| {
    key: string
    kind: 'section'
    /** ссылка на presentation.section.key (orig.1..orig.8, final.1) */
    presentationSectionKey: string
    titleOverride?: string
    blocksTop?: InsurerUiBlock[]
    blocksBottom?: InsurerUiBlock[]
    prefill?: InsurerUiPrefill[]
  }

  | {
      key: 'result'
      kind: 'result'
      title: string
      blocksTop?: InsurerUiBlock[]
    }

export type InsurerSurveyUi = {
  version: SurveyTemplateVersion
  templateTitle: string
  progress: InsurerUiProgress
  header: {
    /** общий хэдер для всех страниц wizard (кроме cover — там свой) */
    blocks: InsurerUiBlock[]
  }
  pages: InsurerUiPage[]
  /**
   * Для фронта: быстрый доступ к данным (чтобы не импортировать отдельно)
   * Можно удалить, если фронт уже получает template/presentation по API.
   */
  data: {
    template: typeof SURVEY_TEMPLATE_V1
    presentation: typeof SURVEY_V1_PRESENTATION
  }
}

const HEADER_BLOCKS: InsurerUiBlock[] = [
  {
    type: 'titleRow',
    leftText: 'ЗАЯВЛЕНИЕ — ВОПРОСНИК',
    rightLogo: { kind: 'frontAssetKey', key: 'elbrus-logo' },
  },
  { type: 'subtitle', text: 'НА СТРАХОВАНИЕ ИНФОРМАЦИОННЫХ (КИБЕР) РИСКОВ' },
  { type: 'divider' },
]

export const INSURER_SURVEY_UI_V1: InsurerSurveyUi = {
  version: 'v1',
  templateTitle: SURVEY_TEMPLATE_V1.title,

  // Начинаем с простого.
  progress: { mode: 'pages' },

  header: {
    blocks: HEADER_BLOCKS,
  },

  pages: [
    // 0) Титул
    {
      key: 'cover',
      kind: 'cover',
      title: 'Заявление — вопросник',
      blocks: [
        {
          type: 'titleRow',
          leftText: 'ЗАЯВЛЕНИЕ — ВОПРОСНИК',
          rightLogo: { kind: 'frontAssetKey', key: 'elbrus-logo' },
        },
        { type: 'subtitle', text: 'НА СТРАХОВАНИЕ ИНФОРМАЦИОННЫХ (КИБЕР) РИСКОВ' },
        { type: 'divider' },
        {
          type: 'text',
          text: 'Пожалуйста, заполните анкету. Вы сможете вернуться к предыдущим разделам в любой момент.',
        },
      ],
      primaryActionLabel: 'Начать',
    },

    // 1..8) Разделы (orig.1..orig.8 из presentation.ts)
    { key: 'section-1', kind: 'section', presentationSectionKey: 'orig.1' },
    { key: 'section-2', kind: 'section', presentationSectionKey: 'orig.2' },
    { key: 'section-3', kind: 'section', presentationSectionKey: 'orig.3' },
    { key: 'section-4', kind: 'section', presentationSectionKey: 'orig.4' },
    { key: 'section-5', kind: 'section', presentationSectionKey: 'orig.5' },
    { key: 'section-6', kind: 'section', presentationSectionKey: 'orig.6' },
    { key: 'section-7', kind: 'section', presentationSectionKey: 'orig.7' },
    { key: 'section-8', kind: 'section', presentationSectionKey: 'orig.8' },

    // 9) Финальная страница (final.1 из presentation.ts)
    {
      key: 'final',
      kind: 'section',
      presentationSectionKey: 'final.1',
      prefill: [
        {
          type: 'fromInsureeCard',
          fields: [
            { questionId: 's26.91.signer_name', path: 'contactName' },
            { questionId: 's26.92.signer_position', path: 'contactPosition' },

            // опционально: подставим контакт для уточнений (если в карточке есть email/телефон)
            { questionId: 's26.03.contact_for_followups', path: 'contactEmail' },
          ],
        },
      ],
    },

    // 10) Результат/отправка
    {
      key: 'result',
      kind: 'result',
      title: 'Результат',
      blocksTop: [
        { type: 'text', text: 'Спасибо! Анкета заполнена. Вы можете отправить ответы брокеру/страховщику.' },
      ],
    },
  ],

  data: {
    template: SURVEY_TEMPLATE_V1,
    presentation: SURVEY_V1_PRESENTATION,
  },
}
