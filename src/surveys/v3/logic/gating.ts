// src/surveys/v3/logic/gating.ts
import type { Question, Section } from '../types';
export type AnswersDict = Record<string, unknown>;

import { processBySection } from '../process/processBySection';
import { getTargetLevel } from '../process/targetsBySection';
import type { Level, NAPolicy, BlockerRule } from '../process/process.types';

// Тип параметра, который ожидает getTargetLevel
type TargetSectionKey = Parameters<typeof getTargetLevel>[0];
// Ключи для индексации processBySection
type ProcessSectionKey = keyof typeof processBySection;

// Приведение к ключу для processBySection
function asProcessSectionKey(key: string): ProcessSectionKey {
  if (key in processBySection) {
    return key as ProcessSectionKey;
  }
  const first = Object.keys(processBySection)[0] as ProcessSectionKey;
  return first;
}

// Приведение к ключу для getTargetLevel (строго тип параметра из сигнатуры getTargetLevel)
function asTargetSectionKey(key: string): TargetSectionKey {
  // Поскольку TargetSectionKey — это юнит строковых литералов,
  // делаем проверку по наличию ключа в processBySection как минимальный страж.
  if (key in processBySection) {
    return key as TargetSectionKey;
  }
  const first = Object.keys(processBySection)[0] as TargetSectionKey;
  return first;
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
  const pKey = asProcessSectionKey(section.key);
  const cfg = processBySection[pKey];
  if (!cfg) return false;

  const req = cfg.requiredByLevel?.[level] ?? [];
  if (req.length === 0) return false;

  const naPolicy = getLevelNaPolicy(pKey, level);
  // 1) все обязательные — отвечены и проходят
  for (const qId of req) {
    const val = answers[qId];
    if (val == null || val === '') return false;
    // ищем метаданные вопроса (answerType), если нужно расширить типы
    const q = section.questions.find((x) => x.id === qId);
    if (!q) return false;
    if (q.answerType === 'radio') {
      if (!isRadioOk(val, naPolicy)) return false;
    } else {
      // По умолчанию: наличие ответа
      // при необходимости — расширить под типы number, checkbox и т.д.
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
  const tKey = asTargetSectionKey(section.key);
  const target = getTargetLevel(tKey);
  let current: Level | 0 = 0;
  for (let lvl = 1 as Level; lvl <= target; lvl = ((lvl + 1) as Level)) {
    const ok = checkLevelPassed(section, answers, lvl);
    if (ok) current = lvl;
    else break;
  }
  return current;
}

/** Вопросы, доступные к заполнению:
 * показываем уровни <= min(targetLevel, achieved + 1)
 */
export function getVisibleQuestions(
  section: Section,
  answers: AnswersDict
): Question[] {
  const tKey = asTargetSectionKey(section.key);
  const target = getTargetLevel(tKey);
  const achieved = getAchievedLevel(section, answers);
  const maxVisible = Math.min((achieved || 0) + 1, target);
  return section.questions.filter((q) => (q.level ?? 1) <= maxVisible);
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
