// src/surveys/v3/types/section-keys.ts

// Полный и стабильный список ключей доменов v3 (s01..s16)
export const ALL_SECTION_KEYS = [
  'org_structure',
  'it_asset_mgmt',
  'risk_based',
  'security_architecture',
  'security_strategy',
  'reporting_metrics',
  'change_mgmt',
  'access_mgmt',
  'network_security',
  'endpoint_security',
  'data_security',
  'security_monitoring',
  'vulnerability_mgmt',
  'pentesting',
  'incident_mgmt',
  'security_culture',
] as const;

export type SectionKey = typeof ALL_SECTION_KEYS[number];

// Уровни строго 1..5
export type TargetLevel = 1 | 2 | 3 | 4 | 5;

// Строгий тип “ЦУЗ по секции”: требуется покрыть все SectionKey
export type TargetBySectionStrict = {
  [K in SectionKey]: {
    sectionKey: K;        // исключает опечатки, ключ совпадает со значением
    targetLevel: TargetLevel;
    rationale?: string;
  }
};
