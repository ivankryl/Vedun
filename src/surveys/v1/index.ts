// src/surveys/v1/index.ts
import type { SurveyTemplate } from './types'

import { SECTION_00_GENERAL } from './sections/00_general'
import { SECTION_01_INSURANCE_PROTECTION } from './sections/01_insurance_protection'
import { SECTION_02_IT_IB_STAFF_MSP_MSSP } from './sections/02_it_ib_staff_msp_mssp'
import { SECTION_03_ACCESS_MANAGEMENT } from './sections/03_access_management'
import { SECTION_04_NETWORK_SECURITY } from './sections/04_network_security'
import { SECTION_05_DATA_PROTECTION } from './sections/05_data_protection'
import { SECTION_06_ENDPOINT_PROTECTION } from './sections/06_endpoint_protection'
import { SECTION_07_SECURITY_OPS_ANALYTICS } from './sections/07_security_ops_analytics'
import { SECTION_08_IT_SERVICE_PROVIDERS } from './sections/08_it_service_providers'
import { SECTION_09_EFFECTIVE_CYBERSECURITY } from './sections/09_effective_cybersecurity'
import { SECTION_10_GOVERNANCE_PROGRAM } from './sections/10_governance_program'
import { SECTION_11_SECOPS_INCIDENT_THREAT_INTEL } from './sections/11_secops_incident_threat_intel'
import { SECTION_12_RESILIENCE_CONTINUITY } from './sections/12_resilience_continuity'
import { SECTION_13_NETWORK_INFRASTRUCTURE } from './sections/13_network_infrastructure'
import { SECTION_14_PEOPLE_AWARENESS } from './sections/14_people_awareness'
import { SECTION_15_CLOUD_SECURITY } from './sections/15_cloud_security'
import { SECTION_16_IAM_ACCESS_REMOTE } from './sections/16_iam_access_remote'
import { SECTION_17_PRIVACY_RISK_INVENTORY } from './sections/17_privacy_risk_inventory'
import { SECTION_18_DATA_PROTECTION } from './sections/18_data_protection'
import { SECTION_19_VULNERABILITY_APPSEC } from './sections/19_vulnerability_appsec'
import { SECTION_20_THIRD_PARTY_SUPPLY_CHAIN } from './sections/20_third_party_supply_chain'
import { SECTION_21_INCIDENT_RESPONSE_MONITORING } from './sections/21_incident_response_monitoring'
import { SECTION_22_PHYSICAL_SECURITY } from './sections/22_physical_security'
import { SECTION_23_HR_SECURITY_TRAINING } from './sections/23_hr_security_training'
import { SECTION_24_COMPLIANCE_AUDIT_CERTIFICATIONS } from './sections/24_compliance_audit_certifications'

// 25 = Финансы
import { SECTION_25_FINANCIAL_METRICS } from './sections/25_financial_metrics'

// 26 = Завершающая (notes/attachments + attestation/подпись)
import { SECTION_26_OPEN_NOTES_ATTACHMENTS } from './sections/26_open_notes_attachments'

export const SURVEY_TEMPLATE_V1: SurveyTemplate = {
  version: 'v1',
  title: 'Кибер-опросник (v1)',
  sections: [
    SECTION_00_GENERAL,
    SECTION_01_INSURANCE_PROTECTION,
    SECTION_02_IT_IB_STAFF_MSP_MSSP,
    SECTION_03_ACCESS_MANAGEMENT,
    SECTION_04_NETWORK_SECURITY,
    SECTION_05_DATA_PROTECTION,
    SECTION_06_ENDPOINT_PROTECTION,
    SECTION_07_SECURITY_OPS_ANALYTICS,
    SECTION_08_IT_SERVICE_PROVIDERS,
    SECTION_09_EFFECTIVE_CYBERSECURITY,
    SECTION_10_GOVERNANCE_PROGRAM,
    SECTION_11_SECOPS_INCIDENT_THREAT_INTEL,
    SECTION_12_RESILIENCE_CONTINUITY,
    SECTION_13_NETWORK_INFRASTRUCTURE,
    SECTION_14_PEOPLE_AWARENESS,
    SECTION_15_CLOUD_SECURITY,
    SECTION_16_IAM_ACCESS_REMOTE,
    SECTION_17_PRIVACY_RISK_INVENTORY,
    SECTION_18_DATA_PROTECTION,
    SECTION_19_VULNERABILITY_APPSEC,
    SECTION_20_THIRD_PARTY_SUPPLY_CHAIN,
    SECTION_21_INCIDENT_RESPONSE_MONITORING,
    SECTION_22_PHYSICAL_SECURITY,
    SECTION_23_HR_SECURITY_TRAINING,
    SECTION_24_COMPLIANCE_AUDIT_CERTIFICATIONS,

    // Секция 8: финансы
    SECTION_25_FINANCIAL_METRICS,

    // Финальная страница: доп.материалы + согласие/подпись
    SECTION_26_OPEN_NOTES_ATTACHMENTS,
  ],
}
