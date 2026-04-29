import type { IndexFile, Exam, VocabEntry } from '../types';

const BASE = import.meta.env?.BASE_URL ?? '/';
const url = (path: string) => `${BASE}data/${path}`.replace(/\/+/g, '/');

let indexP: Promise<IndexFile> | null = null;
const examP = new Map<string, Promise<Exam>>();
let vocabP: Promise<VocabEntry[]> | null = null;

async function fetchJson<T>(path: string): Promise<T> {
  const r = await fetch(url(path));
  if (!r.ok) throw new Error(`fetch ${path}: ${r.status}`);
  return r.json() as Promise<T>;
}

export function loadIndex(): Promise<IndexFile> {
  if (!indexP) indexP = fetchJson<IndexFile>('index.json');
  return indexP;
}

export async function loadExam(id: string): Promise<Exam> {
  if (examP.has(id)) return examP.get(id)!;
  const idx = await loadIndex();
  const entry = idx.exams.find((e) => e.id === id);
  if (!entry) throw new Error(`unknown exam: ${id}`);
  const p = fetchJson<Exam>(entry.file);
  examP.set(id, p);
  return p;
}

export function loadVocab(): Promise<VocabEntry[]> {
  if (!vocabP) vocabP = fetchJson<VocabEntry[]>('vocab.json');
  return vocabP;
}

export function _resetCache() {
  indexP = null;
  examP.clear();
  vocabP = null;
}
