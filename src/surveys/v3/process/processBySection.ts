// src/surveys/v3/process/processBySection.ts
import type { ProcessBySection } from './process.types';

// ВНИМАНИЕ: идентификаторы вопросов должны совпадать с секциями s01..s16
export const processBySection: ProcessBySection = {
  // 01 — Организационная структура
  org_structure: {
    sectionKey: 'org_structure',
    requiredByLevel: {
      1: ['s01.org.l1.q1', 's01.org.l1.q2'],
      2: ['s01.org.l2.q1', 's01.org.l2.q2', 's01.org.l2.q3', 's01.org.l2.q4', 's01.org.l2.q5'],
      3: ['s01.org.l3.q1', 's01.org.l3.q2', 's01.org.l3.q3'],
      4: ['s01.org.l4.q1', 's01.org.l4.q2'],
      5: ['s01.org.l5.q1'],
    },
    blockers: {
      2: [{ ifNo: ['s01.org.l2.q2'] }], // пример: если ключевой орг.принцип не соблюден — не даем L2
    },
    naPolicy: 'default',
  },

  // 02 — Управление ИТ-активами
  it_asset_mgmt: {
    sectionKey: 'it_asset_mgmt',
    requiredByLevel: {
      1: [
        's02.itam.l1.q1',
        's02.itam.l1.q2',
        's02.itam.l1.q3',
        's02.itam.l1.q4',
        's02.itam.l1.q5',
        's02.itam.l1.q6',
      ],
      2: ['s02.itam.l2.q1', 's02.itam.l2.q2', 's02.itam.l2.q3'],
      3: ['s02.itam.l3.q1', 's02.itam.l3.q2', 's02.itam.l3.q3'],
      4: ['s02.itam.l4.q1'],
      5: ['s02.itam.l5.q1'],
    },
    naPolicy: 'default',
  },

  // 03 — Риск-ориентированный подход
  risk_based: {
    sectionKey: 'risk_based',
    requiredByLevel: {
      1: ['s03.risk.l1.q1', 's03.risk.l1.q2'],
      2: ['s03.risk.l2.q1', 's03.risk.l2.q2', 's03.risk.l2.q3', 's03.risk.l2.q4'],
      3: ['s03.risk.l3.q1', 's03.risk.l3.q2', 's03.risk.l3.q3', 's03.risk.l3.q4'],
      4: ['s03.risk.l4.q1', 's03.risk.l4.q2', 's03.risk.l4.q3'],
      5: ['s03.risk.l5.q1', 's03.risk.l5.q2'],
    },
    blockers: {
      3: [{ ifNo: ['s03.risk.l2.q1'] }], // без общей модели угроз — нельзя L3
    },
    naPolicy: {
      2: 'block_critical', // на L2 НП по критичным вопросам блокирует процессный переход
      3: 'default',
      4: 'default',
      5: 'default',
    },
  },

  // 04 — Архитектура ИБ
  security_architecture: {
    sectionKey: 'security_architecture',
    requiredByLevel: {
      1: ['s04.sarch.l1.q1', 's04.sarch.l1.q2'],
      2: ['s04.sarch.l2.q1', 's04.sarch.l2.q2', 's04.sarch.l2.q3', 's04.sarch.l2.q4'],
      3: ['s04.sarch.l3.q1', 's04.sarch.l3.q2', 's04.sarch.l3.q3', 's04.sarch.l3.q4'],
      4: ['s04.sarch.l4.q1'],
      5: ['s04.sarch.l5.q1'],
    },
    blockers: {
      3: [{ ifNo: ['s04.sarch.l2.q1'] }], // без роли архитектора — нет L3
    },
    naPolicy: 'default',
    dependencies: ['it_asset_mgmt'],
  },

  // 05 — Стратегия ИБ
  security_strategy: {
    sectionKey: 'security_strategy',
    requiredByLevel: {
      1: ['s05.sstr.l1.q1', 's05.sstr.l1.q2'],
      2: ['s05.sstr.l2.q1', 's05.sstr.l2.q2', 's05.sstr.l2.q3'],
      3: ['s05.sstr.l3.q1', 's05.sstr.l3.q2', 's05.sstr.l3.q3'],
      4: ['s05.sstr.l4.q1', 's05.sstr.l4.q2'],
      5: ['s05.sstr.l5.q1'],
    },
    blockers: {
      3: [{ ifNo: ['s05.sstr.l2.q2'] }], // без защищенного бюджета — нет L3
    },
    naPolicy: 'default',
    dependencies: ['risk_based'],
  },

  // 06 — Отчетность и метрики
  reporting_metrics: {
    sectionKey: 'reporting_metrics',
    requiredByLevel: {
      1: ['s06.rep.l1.q1', 's06.rep.l1.q2'],
      2: ['s06.rep.l2.q1', 's06.rep.l2.q2', 's06.rep.l2.q3'],
      3: ['s06.rep.l3.q1', 's06.rep.l3.q2'],
      4: ['s06.rep.l4.q1'],
      5: ['s06.rep.l5.q1'],
    },
    naPolicy: 'default',
    dependencies: ['security_strategy'],
  },

  // 07 — Управление изменениями
  change_mgmt: {
    sectionKey: 'change_mgmt',
    requiredByLevel: {
      1: ['s07.chg.l1.q1', 's07.chg.l1.q2'],
      2: ['s07.chg.l2.q1', 's07.chg.l2.q2', 's07.chg.l2.q3'],
      3: ['s07.chg.l3.q1', 's07.chg.l3.q2'],
      4: ['s07.chg.l4.q1'],
      5: ['s07.chg.l5.q1'],
    },
    naPolicy: 'default',
    dependencies: ['org_structure', 'security_architecture'],
  },

  // 08 — Управление доступом
  access_mgmt: {
    sectionKey: 'access_mgmt',
    requiredByLevel: {
      1: ['s08.acc.l1.q1', 's08.acc.l1.q2', 's08.acc.l1.q3', 's08.acc.l1.q4'],
      2: [
        's08.acc.l2.q1',
        's08.acc.l2.q2',
        's08.acc.l2.q3',
        's08.acc.l2.q4',
        's08.acc.l2.q5',
        's08.acc.l2.q6',
        's08.acc.l2.q7',
        's08.acc.l2.q8',
        's08.acc.l2.q9',
      ],
      3: [
        's08.acc.l3.q1',
        's08.acc.l3.q2',
        's08.acc.l3.q3',
        's08.acc.l3.q4',
        's08.acc.l3.q5',
        's08.acc.l3.q6',
        's08.acc.l3.q7',
        's08.acc.l3.q8',
      ],
      4: ['s08.acc.l4.q1', 's08.acc.l4.q2', 's08.acc.l4.q3'],
      5: ['s08.acc.l5.q1'],
    },
    blockers: {
      3: [{ ifNo: ['s08.acc.l2.q2', 's08.acc.l2.q3'] }], // без политики доступа и PUA — нет L3
      4: [{ ifNo: ['s08.acc.l3.q7'] }], // без PAM — нет L4
    },
    naPolicy: 'default',
    dependencies: ['org_structure'],
  },

  // 09 — Сетевая безопасность
  network_security: {
    sectionKey: 'network_security',
    requiredByLevel: {
      1: [
        's09.net.l1.q1',
        's09.net.l1.q2',
        's09.net.l1.q3',
        's09.net.l1.q4',
        's09.net.l1.q5',
        's09.net.l1.q6',
        's09.net.l1.q7',
        's09.net.l1.q8',
        's09.net.l1.q9',
      ],
      2: [
        's09.net.l2.q1',
        's09.net.l2.q2',
        's09.net.l2.q3',
        's09.net.l2.q4',
        's09.net.l2.q5',
        's09.net.l2.q6',
        's09.net.l2.q7',
        's09.net.l2.q8',
        's09.net.l2.q9',
        's09.net.l2.q10',
      ],
      3: ['s09.net.l3.q1', 's09.net.l3.q2', 's09.net.l3.q3', 's09.net.l3.q4'],
      4: ['s09.net.l4.q1', 's09.net.l4.q2'],
      5: ['s09.net.l5.q1', 's09.net.l5.q2'],
    },
    blockers: {
      2: [{ ifNo: ['s09.net.l1.q3'] }], // без сегментации — не даем L2
      3: [{ ifNo: ['s09.net.l2.q1'] }], // без NGFW/UTM — нет L3
    },
    naPolicy: 'default',
    dependencies: ['it_asset_mgmt'],
  },

  // 10 — Безопасность конечных устройств
  endpoint_security: {
    sectionKey: 'endpoint_security',
    requiredByLevel: {
      1: [
        's10.endp.l1.q1',
        's10.endp.l1.q2',
        's10.endp.l1.q3',
        's10.endp.l1.q4',
        's10.endp.l1.q5',
        's10.endp.l1.q6',
        's10.endp.l1.q7',
        's10.endp.l1.q8',
        's10.endp.l1.q9',
        's10.endp.l1.q10',
        's10.endp.l1.q11',
      ],
      2: [
        's10.endp.l2.q1',
        's10.endp.l2.q2',
        's10.endp.l2.q3',
        's10.endp.l2.q4',
        's10.endp.l2.q5',
        's10.endp.l2.q6',
        's10.endp.l2.q7',
        's10.endp.l2.q8',
        's10.endp.l2.q9',
        's10.endp.l2.q10',
        's10.endp.l2.q11',
      ],
      3: ['s10.endp.l3.q1'],
      4: ['s10.endp.l4.q1', 's10.endp.l4.q2'],
      5: ['s10.endp.l5.q1'],
    },
    blockers: {
      2: [{ ifNo: ['s10.endp.l1.q8', 's10.endp.l1.q9'] }], // без АВПО покрытия — нет L2
      3: [{ ifNo: ['s10.endp.l2.q10', 's10.endp.l2.q11'] }], // без EDR/XDR и интеграции — нет L3
    },
    naPolicy: 'default',
    dependencies: ['it_asset_mgmt'],
  },

  // 11 — Безопасность данных
  data_security: {
    sectionKey: 'data_security',
    requiredByLevel: {
      1: ['s11.data.l1.q1', 's11.data.l1.q2', 's11.data.l1.q3', 's11.data.l1.q4'],
      2: [
        's11.data.l2.q1',
        's11.data.l2.q2',
        's11.data.l2.q3',
        's11.data.l2.q4',
        's11.data.l2.q5',
        's11.data.l2.q6',
        's11.data.l2.q7',
      ],
      3: ['s11.data.l3.q1', 's11.data.l3.q2', 's11.data.l3.q3', 's11.data.l3.q4', 's11.data.l3.q5', 's11.data.l3.q6'],
      4: ['s11.data.l4.q1', 's11.data.l4.q2'],
      5: ['s11.data.l5.q1'],
    },
    blockers: {
      3: [{ ifNo: ['s11.data.l2.q5'] }], // без DLP покрытия — нет L3
    },
    naPolicy: 'default',
    dependencies: ['risk_based'],
  },

  // 12 — Мониторинг ИБ
  security_monitoring: {
    sectionKey: 'security_monitoring',
    requiredByLevel: {
      1: ['s12.mon.l1.q1', 's12.mon.l1.q2'],
      2: ['s12.mon.l2.q1', 's12.mon.l2.q2', 's12.mon.l2.q3', 's12.mon.l2.q4'],
      3: ['s12.mon.l3.q1', 's12.mon.l3.q2', 's12.mon.l3.q3'],
      4: ['s12.mon.l4.q1', 's12.mon.l4.q2'],
      5: ['s12.mon.l5.q1'],
    },
    blockers: {
      2: [{ ifNo: ['s12.mon.l1.q2'] }], // без анализа журналов — нет L2
      3: [{ ifNo: ['s12.mon.l2.q4'] }], // без SIEM/SOC покрытия — нет L3
    },
    naPolicy: 'default',
    dependencies: ['it_asset_mgmt', 'network_security', 'endpoint_security'],
  },

  // 13 — Управление уязвимостями (детализация v3)
  vulnerability_mgmt_v3: {
    sectionKey: 'vulnerability_mgmt',
    requiredByLevel: {
      1: ['s13.vuln.l1.q1', 's13.vuln.l1.q2', 's13.vuln.l1.q3'],
      2: [
        's13.vuln.l2.q1',
        's13.vuln.l2.q2',
        's13.vuln.l2.q3',
        's13.vuln.l2.q4',
        's13.vuln.l2.q5',
        's13.vuln.l2.q6',
        's13.vuln.l2.q7',
        's13.vuln.l2.q8',
      ],
      3: ['s13.vuln.l3.q1', 's13.vuln.l3.q2', 's13.vuln.l3.q3', 's13.vuln.l3.q4', 's13.vuln.l3.q5'],
      4: ['s13.vuln.l4.q1', 's13.vuln.l4.q2'],
      5: ['s13.vuln.l5.q1'],
    },
    blockers: {
      2: [{ ifNo: ['s13.vuln.l1.q2'] }], // без устранения крит/высоких — нет L2
      3: [{ ifNo: ['s13.vuln.l2.q4', 's13.vuln.l2.q5'] }], // без расписания сканов и управления обновлениями — нет L3
    },
    naPolicy: 'default',
    dependencies: ['it_asset_mgmt'],
  },

  // 14 — Тесты на проникновение
  pentesting: {
    sectionKey: 'pentesting',
    requiredByLevel: {
      1: ['s14.pentest.l1.q1', 's14.pentest.l1.q2', 's14.pentest.l1.q3'],
      2: ['s14.pentest.l2.q1'],
      3: ['s14.pentest.l3.q1'],
      4: ['s14.pentest.l4.q1', 's14.pentest.l4.q2'],
      5: ['s14.pentest.l5.q1'],
    },
    blockers: {
      2: [{ ifNo: ['s14.pentest.l1.q3'] }], // без планов устранения — нет L2
      4: [{ ifNo: ['s14.pentest.l3.q1'] }], // без программы Bug Bounty — нет L4
    },
    naPolicy: 'default',
    dependencies: ['risk_based', 'incident_mgmt'],
  },

  // 15 — Управление инцидентами ИБ (детализация v3)
  incident_mgmt_v3: {
    sectionKey: 'incident_mgmt',
    requiredByLevel: {
      1: ['s15.inc.l1.q1', 's15.inc.l1.q2'],
      2: ['s15.inc.l2.q1', 's15.inc.l2.q2', 's15.inc.l2.q3', 's15.inc.l2.q4', 's15.inc.l2.q5'],
      3: ['s15.inc.l3.q1', 's15.inc.l3.q2', 's15.inc.l3.q3', 's15.inc.l3.q4', 's15.inc.l3.q5'],
      4: ['s15.inc.l4.q1'],
      5: ['s15.inc.l5.q1'],
    },
    blockers: {
      2: [{ ifNo: ['s15.inc.l1.q2'] }], // без фиксации инцидентов — нет L2
      3: [{ ifNo: ['s15.inc.l2.q4'] }], // без ИС для регистрации — нет L3
    },
    naPolicy: 'default',
    dependencies: ['risk_based', 'security_monitoring'],
  },

  // 16 — Культура ИБ
  security_culture: {
    sectionKey: 'security_culture',
    requiredByLevel: {
      1: ['s16.cult.l1.q1', 's16.cult.l1.q2'],
      2: ['s16.cult.l2.q1', 's16.cult.l2.q2', 's16.cult.l2.q3', 's16.cult.l2.q4'],
      3: [
        's16.cult.l3.q1',
        's16.cult.l3.q2',
        's16.cult.l3.q3',
        's16.cult.l3.q4',
        's16.cult.l3.q5',
        's16.cult.l3.q6',
        's16.cult.l3.q7',
        's16.cult.l3.q8',
      ],
      4: ['s16.cult.l4.q1', 's16.cult.l4.q2', 's16.cult.l4.q3'],
      5: ['s16.cult.l5.q1', 's16.cult.l5.q2'],
    },
    blockers: {
      3: [{ ifNo: ['s16.cult.l2.q2', 's16.cult.l2.q3'] }], // без киберучений и базы знаний — нет L3
    },
    naPolicy: 'default',
    dependencies: ['org_structure'],
  },
};

export default processBySection;
