// src/surveys/v3/process/visible.ts
import { SURVEY_TEMPLATE_V3 } from '../index';
import { SURVEY_V3_PRESENTATION } from '../presentation';
import type { Section } from '../types';
import type { AnswersDict } from '../logic/gating';
import { getVisibleQuestions, computeUnlockedPresentationKeys, getAchievedLevel } from '../logic/gating';

const sectionByKey: Record<string, Section> = {};
for (const s of SURVEY_TEMPLATE_V3.sections) sectionByKey[s.key] = s;

const presentationToSection: Record<string, Section> = {};
for (const p of SURVEY_V3_PRESENTATION.sections) {
  const sectionKey = p.sectionKeys?.[0];
  if (sectionKey && sectionByKey[sectionKey]) {
    presentationToSection[p.key] = sectionByKey[sectionKey];
  }
}

export function buildVisibleStateV3(answersBySectionKey: Record<string, AnswersDict>) {
  const orderedKeys = SURVEY_V3_PRESENTATION.sections.map((p) => p.key);
  const domainKeys = orderedKeys.filter((k) => k.startsWith('orig.'));

  // Порог для перехода к следующему домену
  const unlocked = computeUnlockedPresentationKeys(
    presentationToSection,
    answersBySectionKey,
    domainKeys,
    1 // требуем L1 на предыдущем домене
  );

  // Финал доступен, если все домены достигли не ниже L1 (можно поднять до L3/L5)
  const allReachedL1 = domainKeys.every((pKey) => {
    const section = presentationToSection[pKey];
    if (!section) return false;
    const ans = answersBySectionKey[section.key] ?? {};
    return getAchievedLevel(section, ans) >= 1;
  });

  if (allReachedL1) unlocked.push('final.1');

  // Видимые вопросы (уровень <= min(targetLevel, achieved+1))
  const visibleQuestionsBySectionKey: Record<string, string[]> = {};
  for (const pKey of orderedKeys) {
    const section = presentationToSection[pKey];
    if (!section) continue;
    const answers = answersBySectionKey[section.key] ?? {};
    const visible = getVisibleQuestions(section, answers);
    visibleQuestionsBySectionKey[section.key] = visible.map((q) => q.id);
  }

  return {
    unlockedPresentationKeys: unlocked,
    visibleQuestionsBySectionKey,
  };
}
