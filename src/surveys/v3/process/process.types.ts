/// src/surveys/v3/process/process.types.ts
// Специальные типы для конфигов процесса/целей. Избегаем конфликта с logic/types.ts и v3/types.ts
export type Level = 1 | 2 | 3 | 4 | 5;
export type ProcessStatus = 'fulfilled' | 'partial' | 'not_fulfilled';

export type BlockerRule =
  | { ifNo: string[] }          // если любой из указанных вопросов имеет ответ "no" — блокируем уровень
  | { ifMissing: string[] }     // если отсутствуют ответы (валидация) — блокируем уровень
  | { ifNA: string[] };         // если ответы "na" по указанным вопросам — блокируем уровень (процессно)

export type NAPolicy = 'default' | 'block_critical' | 'ignore';
// default: НП учитывается как weight=0 в балле, процесс не блокируется
// block_critical: НП по критичным вопросам блокирует достижение уровня
// ignore: трактуем НП как отсутствующий ответ (и для балла, и процессно)

export interface SectionProcessConfig {
  sectionKey: string;
  requiredByLevel: Partial<Record<Level, string[]>>; // обязательные вопросы для достижения уровня
  blockers?: Partial<Record<Level, BlockerRule[]>>;  // правила блокировки уровня
  naPolicy?: NAPolicy | Partial<Record<Level, NAPolicy>>; // политика НП по секции/уровню
  dependencies?: string[]; // ключи секций, от которых зависит текущая (для UI/порядка)
}

export type ProcessBySection = Record<string, SectionProcessConfig>;

export interface TargetBySectionItem {
  sectionKey: string;
  targetLevel: Level;
  rationale?: string;
}

export type TargetsBySection = Record<string, TargetBySectionItem>;
