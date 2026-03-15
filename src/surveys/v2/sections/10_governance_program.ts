// src/surveys/v2/sections/10_governance_program.ts
import type { Section, Option } from '../types'

const YES_NO_POSITIVE: Option[] = [
  { id: 'yes', label: 'ДА', points: 1, weight: 1 },
  { id: 'no', label: 'НЕТ', points: 0, weight: 0 },
]

export const SECTION_10_GOVERNANCE_PROGRAM: Section = {
  key: 'governance_program',
  title: 'Практики, политика и управление ИБ (Governance)',
  description: 'СУИБ/стандарты, политики, управление подрядчиками, SDLC/архитектура, уязвимости и аудит зрелости.',
  order: 11,
  questions: [
    // СУИБ / стандарты
    {
      id: 's10.01.isms_standards_used',
      sectionKey: 'governance_program',
      categoryKey: 'governance.isms',
      text:
        'Внедрены ли в компании практики/стандарты системы управления ИБ (СУИБ), такие как ISO27001, NIST, SANS Top 20, COBIT4.1 и др.?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's10.02.isms_standards_description',
      sectionKey: 'governance_program',
      categoryKey: 'governance.isms',
      text: 'Опишите практики и стандарты выше',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
      visibleIf: { questionId: 's10.01.isms_standards_used', op: 'equals', value: 'yes' },
    },

    // Политики/процедуры
    {
      id: 's10.03.policies_defined',
      sectionKey: 'governance_program',
      categoryKey: 'governance.policies',
      text:
        'Разработаны ли в компании корпоративные политики, стандарты и процедуры, регламентирующие вопросы в области обеспечения ИБ?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's10.04.policies_communication',
      sectionKey: 'governance_program',
      categoryKey: 'governance.policies',
      text: 'Каким образом данные нормативные документы доносятся до подразделений и сотрудников организации?',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
      visibleIf: { questionId: 's10.03.policies_defined', op: 'equals', value: 'yes' },
    },

    // Подрядчики / оценка / SLA / список доступа
    {
      id: 's10.05.third_party_assessment',
      sectionKey: 'governance_program',
      categoryKey: 'third_party.risk',
      text:
        'Проводится ли самостоятельная оценка потенциальных Подрядчиков и поставляемых ими услуг, включающая определение и классификацию передаваемой информации и проведение оценки рисков ИБ?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's10.06.third_party_assessment_process',
      sectionKey: 'governance_program',
      categoryKey: 'third_party.risk',
      text: 'Как проводится оценка Подрядчиков?',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
      visibleIf: { questionId: 's10.05.third_party_assessment', op: 'equals', value: 'yes' },
    },
    {
      id: 's10.07.sla_in_place',
      sectionKey: 'governance_program',
      categoryKey: 'third_party.contracts',
      text:
        'Заключены ли соглашения об уровне предоставляемых услуг (SLA) с компаниями, предоставляющими аутсорсинг ИТ и сетевой инфраструктуры, связанной с критичными бизнес‑приложениями и процессами?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's10.08.contractors_access_list',
      sectionKey: 'governance_program',
      categoryKey: 'third_party.access',
      text: 'Сформирован ли актуальный список подрядчиков, имеющих доступ к вашей информационной системе?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },

    // Допустимое ПО / приемка ПО
    {
      id: 's10.09.allowed_software_list',
      sectionKey: 'governance_program',
      categoryKey: 'it.software.governance',
      text: 'Определен ли список допустимого к использованию ПО в компании?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's10.10.allowed_software_install_process',
      sectionKey: 'governance_program',
      categoryKey: 'it.software.governance',
      text: 'Опишите процесс установки допустимого ПО',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
      visibleIf: { questionId: 's10.09.allowed_software_list', op: 'equals', value: 'yes' },
    },
    {
      id: 's10.11.software_acceptance_testing',
      sectionKey: 'governance_program',
      categoryKey: 'it.software.security',
      text:
        'Проверяется ли безопасность и работоспособность приобретаемых готовых программных продуктов перед их принятием в эксплуатацию в компании?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's10.12.software_acceptance_testing_process',
      sectionKey: 'governance_program',
      categoryKey: 'it.software.security',
      text: 'Опишите процесс проверки',
      answerType: 'text',
      validation: { required: false, maxLength: 2000 },
      visibleIf: { questionId: 's10.11.software_acceptance_testing', op: 'equals', value: 'yes' },
    },

    // Активы / КИИ / SDLC
    {
      id: 's10.13.asset_classification',
      sectionKey: 'governance_program',
      categoryKey: 'governance.assets',
      text: 'Проведена ли категоризация/классификация информационных активов и определены ли критически важные активы?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's10.14.kii_status_category',
      sectionKey: 'governance_program',
      categoryKey: 'compliance.kii',
      text: 'Являетесь ли вы субъектом КИИ и какая категория объектов присвоена?',
      answerType: 'text',
      validation: { required: false, maxLength: 500 },
    },
    {
      id: 's10.15.security_in_it_processes',
      sectionKey: 'governance_program',
      categoryKey: 'governance.sdlc',
      text:
        'Каким образом ИБ интегрирована в процессы ИТ и управления проектами? Каким образом определяются требования ИБ, а также проводятся оценки рисков и тестирование защищенности на разных этапах жизненного цикла ИТ‑систем/Проектов?',
      answerType: 'text',
      validation: { required: false, maxLength: 3000 },
    },

    // Архитектура / управление СЗИ / уязвимости / аудит
    {
      id: 's10.16.security_architecture_covers_all',
      sectionKey: 'governance_program',
      categoryKey: 'architecture.security',
      text: 'Обеспечивает ли архитектура ИБ постоянную защиту всех информационных систем компании?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's10.17.centralized_security_tools_management',
      sectionKey: 'governance_program',
      categoryKey: 'operations.security_tools',
      text: 'Осуществляется ли централизованное обновление и управление средствами защиты информации?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's10.18.vulnerability_scanning',
      sectionKey: 'governance_program',
      categoryKey: 'operations.vulnerability',
      text:
        'Осуществляются ли в компании периодические сканирования на уязвимости информационных систем и сетевой инфраструктуры в целях определения уязвимостей и приоритизации планов по их устранению?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's10.19.security_maturity_audit',
      sectionKey: 'governance_program',
      categoryKey: 'governance.audit',
      text: 'Проводился ли аудит зрелости информационной безопасности?',
      answerType: 'radio',
      validation: { required: true },
      options: YES_NO_POSITIVE,
    },
    {
      id: 's10.20.audit_report_available',
      sectionKey: 'governance_program',
      categoryKey: 'governance.audit',
      text: 'Возможно ли предоставить отчет по аудиту?',
      answerType: 'radio',
      validation: { required: false },
      options: YES_NO_POSITIVE,
      visibleIf: { questionId: 's10.19.security_maturity_audit', op: 'equals', value: 'yes' },
    },
  ],
}
