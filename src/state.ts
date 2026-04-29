const KEY_PROGRESS = 'jlpt:progress';
const KEY_LAST = 'jlpt:last';
const KEY_SETTINGS = 'jlpt:settings';

export interface AnswerRec { picked: number; correct: boolean; ts: number }
export type ExamProgress = Record<number, AnswerRec>;
export type AllProgress = Record<string, ExamProgress>;

export interface LastPos { examId: string; questionN: number; ts: number }
export interface Settings { furigana: boolean; dark: boolean }

const DEFAULT_SETTINGS: Settings = { furigana: false, dark: false };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('[state] localStorage write failed:', e);
  }
}

export function recordAnswer(examId: string, n: number, picked: number, correct: boolean) {
  const all = read<AllProgress>(KEY_PROGRESS, {});
  if (!all[examId]) all[examId] = {};
  all[examId][n] = { picked, correct, ts: Date.now() };
  write(KEY_PROGRESS, all);
}

export function getProgress(examId: string): ExamProgress {
  return read<AllProgress>(KEY_PROGRESS, {})[examId] ?? {};
}

export function setLast(examId: string, questionN: number) {
  write(KEY_LAST, { examId, questionN, ts: Date.now() });
}

export function getLast(): LastPos | null {
  return read<LastPos | null>(KEY_LAST, null);
}

export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEY_SETTINGS, {}) };
}

export function setSettings(patch: Partial<Settings>) {
  write(KEY_SETTINGS, { ...getSettings(), ...patch });
}
