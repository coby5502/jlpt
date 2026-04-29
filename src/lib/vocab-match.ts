import type { VocabEntry } from '../types';

export interface Segment { text: string; entry: VocabEntry | null }

interface Indexed {
  byHead: Map<string, VocabEntry[]>; // first char -> entries (sorted by length desc)
}

export function buildIndex(vocab: VocabEntry[]): Indexed {
  const byHead = new Map<string, VocabEntry[]>();
  for (const v of vocab) {
    if (!v.w) continue;
    const head = v.w[0];
    let list = byHead.get(head);
    if (!list) { list = []; byHead.set(head, list); }
    list.push(v);
  }
  for (const list of byHead.values()) list.sort((a, b) => b.w.length - a.w.length);
  return { byHead };
}

export function matchVocab(text: string, vocab: VocabEntry[] | Indexed): Segment[] {
  const idx = Array.isArray(vocab) ? buildIndex(vocab) : vocab;
  const out: Segment[] = [];
  let buf = '';
  let i = 0;
  while (i < text.length) {
    const head = text[i];
    const candidates = idx.byHead.get(head);
    let matched: VocabEntry | null = null;
    if (candidates) {
      for (const c of candidates) {
        if (text.startsWith(c.w, i)) { matched = c; break; }
      }
    }
    if (matched) {
      if (buf) { out.push({ text: buf, entry: null }); buf = ''; }
      out.push({ text: matched.w, entry: matched });
      i += matched.w.length;
    } else {
      buf += head;
      i++;
    }
  }
  if (buf) out.push({ text: buf, entry: null });
  return out;
}
