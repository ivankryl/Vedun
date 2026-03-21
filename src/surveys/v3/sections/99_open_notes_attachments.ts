// src/surveys/v3/sections/99_open_notes_attachments.ts
import type { Section } from '../types';

export const SECTION_99_OPEN_NOTES_ATTACHMENTS: Section = {
  key: 'open_notes_attachments',
  title: 'Дополнительно (Notes/Attachments)',
  description: 'Открытые вопросы, комментарии, ссылки на документы/доказательства.',
  order: 99,
  questions: [
    {
      id: 's99.01.additional_notes',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'open.notes',
      text: 'Дополнительные комментарии (что важно отметить, но не попало в анкету).',
      answerType: 'text',
      validation: { required: false, maxLength: 4000 },
    },
    {
      id: 's99.02.links_to_evidence',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'open.attachments',
      text: 'Ссылки на политики/регламенты/сертификаты/отчеты (если можно поделиться).',
      answerType: 'text',
      validation: { required: false, maxLength: 4000 },
    },
    {
      id: 's99.03.contact_for_followups',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'open.contact',
      text: 'Контакт для уточнений (роль, e-mail/ник — если уместно).',
      answerType: 'text',
      validation: { required: false, maxLength: 500 },
    },

    // --- Юридическое подтверждение / подпись (финальная страница мастера) ---
    {
      id: 's99.89.personal_data_consent',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'attestation',
      text: 'Согласие на обработку персональных данных',
      answerType: 'boolean',
      validation: { required: true },
      labels: { trueLabel: 'Да, согласен(на)', falseLabel: 'Нет' },
    },
    {
      id: 's99.90.attestation_consent',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'attestation',
      text: 'Согласие с условиями и подтверждение достоверности сведений',
      answerType: 'boolean',
      validation: { required: true },
      labels: { trueLabel: 'Согласен(на)', falseLabel: 'Не согласен(на)' },
    },
    {
      id: 's99.91.signer_name',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'attestation',
      text: 'Имя и Фамилия подписанта',
      answerType: 'text',
      validation: { required: true, maxLength: 200 },
    },
    {
      id: 's99.92.signer_position',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'attestation',
      text: 'Должность',
      answerType: 'text',
      validation: { required: false, maxLength: 200 },
    },
    {
      id: 's99.93.sign_date',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'attestation',
      text: 'Дата',
      answerType: 'date',
      validation: { required: true },
    },
    {
      id: 's99.94.signature',
      sectionKey: 'open_notes_attachments',
      categoryKey: 'attestation',
      text: 'Подпись (ФИО / электронная подпись / отметка)',
      answerType: 'text',
      validation: { required: false, maxLength: 500 },
    },
  ],
};

export default SECTION_99_OPEN_NOTES_ATTACHMENTS;
