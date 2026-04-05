// src/surveys/v3/logic/gating.ts
import type { Question, Section } from '../types';
export type AnswersDict = Record<string, unknown>;

import { processBySection } from '../process/processBySection';
import { getTargetLevel } from '../process/targetsBySection';
import type { Level, NAPolicy, BlockerRule } from '../process/process.types';

// Типы ключей
type ProcessSectionKey = keyof typeof processBySection;
type TargetSectionKey = Parameters<typeof getTargetLevel>[0];

// Мапа s01..s16 → ключи процесса
const sCodeToProcessKey: Record<string, ProcessSectionKey> = {
  s01: 'org_structure',
  s02: 'it_asset_mgmt',
  s03: 'risk_based',
  s04: 'security_architecture',
  s05: 'security_strategy',
  s06: 'reporting_metrics',
  s07: 'change_mgmt',
  s08: 'access_mgmt',
  s09: 'network_security',
  s10: 'endpoint_security',
  s11: 'data_security',
  s12: 'security_monitoring',
  s13: 'vulnerability_mgmt',
  s14: 'pentesting',
  s15: 'incident_mgmt',
  s16: 'security_culture',
};

// Извлечь префикс sNN из произвольной строки
function extractSCode(val?: unknown): string | null {
  if (typeof val !== 'string') return null;
  const m = val.match(/^s\d{2}/i);
  return m ? m[0].toLowerCase() : null;
}

// Нормализация ключа секции для индексации processBySection
function resolveProcessKey(section: Section): ProcessSectionKey {
  // Возможные дополнительные поля в реальных данных
  const extras = section as unknown as {
    sectionKey?: string;
    id?: string;
    domain?: string;
  };

  const candidates: Array<unknown> = [
    section.key,
    extras.sectionKey,
    extras.id,
    extras.domain,
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && c in processBySection) {
      return c as ProcessSectionKey;
    }
    const sCode = extractSCode(c);
    if (sCode && sCodeToProcessKey[sCode]) {
      return sCodeToProcessKey[sCode];
    }
  }

  // Фолбэк (не должен срабатывать при корректной конфигурации)
  return Object.keys(processBySection)[0] as ProcessSectionKey;
}

// Нормализация ключа для getTargetLevel (строго типизирован)
function resolveTargetKey(section: Section): TargetSectionKey {
  const pKey = resolveProcessKey(section);
  return pKey as unknown as TargetSectionKey;
}

/** Трактовка radio: yes — ок; no — блок; na — зависит от политики */
function isRadioOk(val: unknown, naPolicy: NAPolicy): boolean {
  if (val === 'yes') return true;
  if (val === 'no') return false;
  if (val === 'na') {
    if (naPolicy === 'ignore') return false; // считаем как отсутствующий/не подходит
    // default и block_critical обрабатываются через blockers.ifNA
    return true;
  }
  return false;
}

function getLevelNaPolicy(sectionKey: ProcessSectionKey, level: Level): NAPolicy {
  const cfg = processBySection[sectionKey];
  if (!cfg) return 'default';
  const p = cfg.naPolicy;
  if (!p) return 'default';
  if (typeof p === 'string') return p;
  return (p[level] ?? 'default') as NAPolicy;
}

function violatedByBlockers(
  rules: BlockerRule[] | undefined,
  answers: AnswersDict
): boolean {
  if (!rules || rules.length === 0) return false;
  for (const r of rules) {
    if ('ifNo' in r) {
      if (r.ifNo.some((q) => answers[q] === 'no')) return true;
    }
    if ('ifMissing' in r) {
      if (r.ifMissing.some((q) => answers[q] == null || answers[q] === '')) return true;
    }
    if ('ifNA' in r) {
      if (r.ifNA.some((q) => answers[q] === 'na')) return true;
    }
  }
  return false;
}

/** Проверка уровня с учётом processBySection */
export function checkLevelPassed(
  section: Section,
  answers: AnswersDict,
  level: Level
): boolean {
  const pKey = resolveProcessKey(section);
  const cfg = processBySection[pKey];
  if (!cfg) return false;

  const req = cfg.requiredByLevel?.[level] ?? [];
  if (req.length === 0) return false;

  const naPolicy = getLevelNaPolicy(pKey, level);
  // 1) все обязательные — отвечены и проходят
  for (const qId of req) {
    const val = answers[qId];
    if (val == null || val === '') return false;
    const q = section.questions.find((x) => x.id === qId);
    if (!q) return false;
    if (q.answerType === 'radio') {
      if (!isRadioOk(val, naPolicy)) return false;
    } else {
      // по умолчанию — наличие значения
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!val) return false;
    }
  }

  // 2) блокеры уровня
  const blocked = violatedByBlockers(cfg.blockers?.[level], answers);
  if (blocked) return false;

  return true;
}

/** Достигнутый уровень с учётом целевого уровня (ЦУЗ) */
export function getAchievedLevel(
  section: Section,
  answers: AnswersDict
): Level | 0 {
  const tKey = resolveTargetKey(section);
  const targetRaw = getTargetLevel(tKey);
  const target = Math.max(1, Number(targetRaw || 0)) as Level;

  let current: Level | 0 = 0;
  for (let lvl = 1 as Level; lvl <= target; lvl = ((lvl + 1) as Level)) {
    const ok = checkLevelPassed(section, answers, lvl);
    if (ok) current = lvl;
    else break;
  }
  return current;
}

/** Вопросы, доступные к заполнению:
 * - Уровень 1 всегда виден без ограничений.
 * - Для уровней > 1: показываем уровни <= min(targetLevel, achieved + 1).
 */
export function getVisibleQuestions(
  section: Section,
  answers: AnswersDict
): Question[] {
  const tKey = resolveTargetKey(section);
  const targetRaw = getTargetLevel(tKey);

  // Минимум 1 для расчёта «верхнего уровня», но L1 мы всё равно показываем всегда.
  const target = Math.max(1, Number(targetRaw || 0));
  const achieved = getAchievedLevel(section, answers) || 0;
  const maxVisible = Math.min(achieved + 1, target);

  // Показываем все L1 всегда, а уровни >1 — по гейтингу
  const visible = section.questions.filter((q) => {
    const lvl = typeof q.level === 'number' ? q.level : Number(q.level ?? 1);
    return lvl === 1 || lvl <= maxVisible;
  });

  // На всякий случай: если вдруг массив пуст (не должен), показываем все L1
  if (visible.length === 0) {
    return section.questions.filter((q) => {
      const lvl = typeof q.level === 'number' ? q.level : Number(q.level ?? 1);
      return lvl === 1;
    });
  }

  return visible;
}

/** Разблокировка страниц (доменов) последовательно.
 * Порог можно поднять (например, требовать L2/L3/L5 у предыдущего).
 */
export function computeUnlockedPresentationKeys(
  presentationKeyToSection: Record<string, Section>,
  answersBySectionKey: Record<string, AnswersDict>,
  orderedPresentationKeys: string[],
  requiredPrevLevel: Level = 1
): string[] {
  const unlocked = new Set<string>();
  orderedPresentationKeys.forEach((pKey, idx) => {
    const section = presentationKeyToSection[pKey];
    if (!section) return;
    if (idx === 0) {
      unlocked.add(pKey);
    } else {
      const prevSection = presentationKeyToSection[orderedPresentationKeys[idx - 1]];
      const prevAnswers = answersBySectionKey[prevSection.key] ?? {};
      const prevLevel = getAchievedLevel(prevSection, prevAnswers);
      if (prevLevel >= requiredPrevLevel) {
        unlocked.add(pKey);
      }
    }
  });
  return Array.from(unlocked);
}
