import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadIndex, loadExam, loadVocab, _resetCache } from '../src/lib/data';

// Reference loadVocab to satisfy noUnusedLocals; re-export shape is asserted via type check.
void loadVocab;

beforeEach(() => {
  _resetCache();
  globalThis.fetch = vi.fn() as any;
});

describe('data loader', () => {
  it('fetches index.json once and caches it', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ exams: [{ id: 'a', title: 'A', file: 'exams/a.json', questions: 1, passages: 0, source: '' }] }),
    });
    const a = await loadIndex();
    const b = await loadIndex();
    expect(a).toBe(b);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('loadExam fetches the file path from index entry', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ exams: [{ id: 'x', title: 'X', file: 'exams/x.json', questions: 1, passages: 0, source: '' }] }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ test_id: 'x', title: 'X', source_url: '', scraped_at: '', passages: {}, questions: [] }),
    });
    const e = await loadExam('x');
    expect(e.test_id).toBe('x');
  });

  it('throws on unknown exam id', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ exams: [] }),
    });
    await expect(loadExam('nope')).rejects.toThrow(/unknown exam/);
  });
});
