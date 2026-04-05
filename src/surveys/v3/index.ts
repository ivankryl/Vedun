// src/surveys/v3/index.ts
import type { SurveyTemplate } from './types';

// Шапка (анкетные данные)
import { SECTION_00_GENERAL } from './sections/00_general';

// Основные направления 1–16 (s01..s16)
// ВАЖНО: проверьте, что пути и имена соответствуют вашим файлам в ./sections
import { SECTION_01_ORG_STRUCTURE } from './sections/01_org_structure';
import { SECTION_02_IT_ASSET_MGMT } from './sections/02_it_asset_mgmt';
import { SECTION_03_RISK_BASED } from './sections/03_risk_based';
import { SECTION_04_SECURITY_ARCHITECTURE } from './sections/04_security_architecture';
import { SECTION_05_SECURITY_STRATEGY } from './sections/05_security_strategy';
import { SECTION_06_REPORTING_METRICS } from './sections/06_reporting_metrics';
import { SECTION_07_CHANGE_MGMT } from './sections/07_change_mgmt';
import { SECTION_08_ACCESS_MGMT } from './sections/08_access_mgmt';
import { SECTION_09_NETWORK_SECURITY } from './sections/09_network_security';
import { SECTION_10_ENDPOINT_SECURITY } from './sections/10_endpoint_security';
import { SECTION_11_DATA_SECURITY } from './sections/11_data_security';
import { SECTION_12_SECURITY_MONITORING } from './sections/12_security_monitoring';
import { SECTION_13_VULNERABILITY_MGMT } from './sections/13_vulnerability_mgmt';
import { SECTION_14_PENTESTING } from './sections/14_pentesting';
import { SECTION_15_INCIDENT_MGMT } from './sections/15_incident_mgmt';
import { SECTION_16_SECURITY_CULTURE } from './sections/16_security_culture';
import { SECTION_99_OPEN_NOTES_ATTACHMENTS } from './sections/99_open_notes_attachments';

// Опционально: финальные страницы (заметки/вложения/подтверждение) для v3, если предусмотрены
// import { SECTION_99_NOTES_ATTACHMENTS } from './sections/99_notes_attachments';

export const SURVEY_TEMPLATE_V3: SurveyTemplate = {
  version: 'v3',
  title: 'Кибер-опросник (vx3a)',
  sections: [
    // Стартовая секция
    SECTION_00_GENERAL,

    // 1–16: по вашим утвержденным наименованиям направлений
    SECTION_01_ORG_STRUCTURE,           // 1 — Организационная структура
    SECTION_02_IT_ASSET_MGMT,           // 2 — Управление ИТ-активами
    SECTION_03_RISK_BASED,              // 3 — Риск-ориентированный подход
    SECTION_04_SECURITY_ARCHITECTURE,   // 4 — Архитектура ИБ
    SECTION_05_SECURITY_STRATEGY,       // 5 — Стратегия ИБ
    SECTION_06_REPORTING_METRICS,       // 6 — Отчетность и метрики
    SECTION_07_CHANGE_MGMT,             // 7 — Управление изменениями
    SECTION_08_ACCESS_MGMT,             // 8 — Управление доступом
    SECTION_09_NETWORK_SECURITY,        // 9 — Сетевая безопасность
    SECTION_10_ENDPOINT_SECURITY,       // 10 — Безопасность конечных устройств
    SECTION_11_DATA_SECURITY,           // 11 — Безопасность данных
    SECTION_12_SECURITY_MONITORING,     // 12 — Мониторинг ИБ
    SECTION_13_VULNERABILITY_MGMT,      // 13 — Управление уязвимостями
    SECTION_14_PENTESTING,              // 14 — Тесты на проникновение
    SECTION_15_INCIDENT_MGMT,           // 15 — Управление инцидентами ИБ
    SECTION_16_SECURITY_CULTURE,        // 16 — Культура ИБ

    
    // При необходимости добавьте финальные/служебные секции (заметки, согласие и т.п.)
    SECTION_99_OPEN_NOTES_ATTACHMENTS,  // SECTION_99_NOTES_ATTACHMENTS,
    
  ],
};

export default SURVEY_TEMPLATE_V3;
export { SURVEY_V3_PRESENTATION } from './presentation';
