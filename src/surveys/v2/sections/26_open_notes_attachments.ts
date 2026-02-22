// src/surveys/v1/sections/26_open_notes_attachments.ts
import type { Section } from '../types'

export const SECTION_26_OPEN_NOTES_ATTACHMENTS: Section = {
  key: 'open_notes_attachments',
  title: 'Дополнительно (Notes/Attachments)',
  description: 'Открытые вопросы, комментарии, ссылки на документы/доказательства.',
  order: 27,
  questions: [
    {
      id: 's26.01.additional_notes',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'open.notes',
      text: 'Дополнительные комментарии (что важно отметить, но не попало в анкету).',
      answerType: 'text',
      validation: { required: false, maxLength: 4000 },
    },
    {
      id: 's26.02.links_to_evidence',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'open.attachments',
      text: 'Ссылки на политики/регламенты/сертификаты/отчеты (если можно поделиться).',
      answerType: 'text',
      validation: { required: false, maxLength: 4000 },
    },
    {
      id: 's26.03.contact_for_followups',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'open.contact',
      text: 'Контакт для уточнений (роль, e-mail/ник — если уместно).',
      answerType: 'text',
      validation: { required: false, maxLength: 500 },
    },

    // --- Юридическое подтверждение / подпись (для последней страницы wizard) ---
    {
      id: 's26.90.attestation_consent',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'attestation',
      text: 'Согласие с условиями и подтверждение достоверности сведений',
      answerType: 'boolean',
      validation: { required: true },
      labels: { trueLabel: 'Согласен(на)', falseLabel: 'Не согласен(на)' },
    },
    {
      id: 's26.91.signer_name',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'attestation',
      text: 'Имя и Фамилия подписанта',
      answerType: 'text',
      validation: { required: true, maxLength: 200 },
    },
    {
      id: 's26.92.signer_position',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'attestation',
      text: 'Должность',
      answerType: 'text',
      validation: { required: false, maxLength: 200 },
    },
    {
      id: 's26.93.sign_date',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'attestation',
      text: 'Дата',
      answerType: 'date',
      validation: { required: true },
    },
    {
      id: 's26.94.signature',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'attestation',
      text: 'Подпись (ФИО / электронная подпись / отметка)',
      answerType: 'text',
      validation: { required: false, maxLength: 500 },
    },
  ],
}
