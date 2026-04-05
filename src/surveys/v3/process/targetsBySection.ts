// src/surveys/v3/process/targetsBySection.ts
import type { TargetBySectionStrict, SectionKey, TargetLevel } from '../types/section-keys';

export const targetsBySection = {
  // 01 — Организационная структура
  org_structure: {
    sectionKey: 'org_structure',
    targetLevel: 3,
    rationale: 'Формализовать орг.структуру и роли ИБ для устойчивых процессов.',
  },

  // 02 — Управление ИТ-активами
  it_asset_mgmt: {
    sectionKey: 'it_asset_mgmt',
    targetLevel: 4,
    rationale: 'Требуется CMDB и интеграции для полноты/актуальности данных.',
  },

  // 03 — Риск-ориентированный подход
  risk_based: {
    sectionKey: 'risk_based',
    targetLevel: 4,
    rationale: 'Интеграция с корпоративным риск-менеджментом и аппетит к риску.',
  },

  // 04 — Архитектура ИБ
  security_architecture: {
    sectionKey: 'security_architecture',
    targetLevel: 3,
    rationale: 'Типовые требования и архитектсовет для управляемости изменений.',
  },

  // 05 — Стратегия ИБ
  security_strategy: {
    sectionKey: 'security_strategy',
    targetLevel: 4,
    rationale: 'Стратегия, бюджет и регулярная оценка эффективности.',
  },

  // 06 — Отчетность и метрики
  reporting_metrics: {
    sectionKey: 'reporting_metrics',
    targetLevel: 3,
    rationale: 'Набор KPI/KRI, регулярная управленческая отчётность и улучшения по метрикам.',
  },

  // 07 — Управление изменениями
  change_mgmt: {
    sectionKey: 'change_mgmt',
    targetLevel: 3,
    rationale: 'Интеграция ИБ-контролей в CAB, оценка рисков изменений и post-implementation review.',
  },

  // 08 — Управление доступом
  access_mgmt: {
    sectionKey: 'access_mgmt',
    targetLevel: 4,
    rationale: 'IDM/PAM, регулярные ревью прав и MFA для привилегий.',
  },

  // 09 — Сетевая безопасность
  network_security: {
    sectionKey: 'network_security',
    targetLevel: 4,
    rationale: 'NGFW, микросегментация, web proxy/TLS inspection и интеграция с SOC.',
  },

  // 10 — Безопасность конечных устройств
  endpoint_security: {
    sectionKey: 'endpoint_security',
    targetLevel: 4,
    rationale: 'EDR/XDR с полным покрытием, MDM и контроль конфигураций/образов.',
  },

  // 11 — Безопасность данных
  data_security: {
    sectionKey: 'data_security',
    targetLevel: 4,
    rationale: 'Категорирование, DLP/DCAP, контроль обмена и интеграция с SIEM.',
  },

  // 12 — Мониторинг ИБ
  security_monitoring: {
    sectionKey: 'security_monitoring',
    targetLevel: 4,
    rationale: 'SIEM/SOC, охват ключевых источников, алертинг и SLO по детектированию.',
  },

  // 13 — Управление уязвимостями
  vulnerability_mgmt: {
    sectionKey: 'vulnerability_mgmt',
    targetLevel: 4,
    rationale: 'Непрерывное сканирование, приоритизация, SLA-ремедиация и отчётность.',
  },

  // 14 — Тесты на проникновение
  pentesting: {
    sectionKey: 'pentesting',
    targetLevel: 4,
    rationale: 'Регулярный внешний/внутренний пентест, Bug Bounty и Red Team по приоритетам риска.',
  },

  // 15 — Управление инцидентами ИБ
  incident_mgmt: {
    sectionKey: 'incident_mgmt',
    targetLevel: 4,
    rationale: 'Процессы NIST/SANS, интеграция с SIEM/SOAR и метрики эффективности.',
  },

  // 16 — Культура ИБ
  security_culture: {
    sectionKey: 'security_culture',
    targetLevel: 3,
    rationale: 'Системная осведомлённость, киберучения, LMS и метрики знаний для сотрудников.',
  },
} satisfies TargetBySectionStrict;

export default targetsBySection;

// Строго типизированный хелпер для Gating
export function getTargetLevel(sectionKey: SectionKey): TargetLevel {
  return targetsBySection[sectionKey].targetLevel;
}
