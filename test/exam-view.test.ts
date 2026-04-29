import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderExam } from '../src/views/exam';
import { _resetCache } from '../src/lib/data';

beforeEach(() => {
  _resetCache();
  globalThis.fetch = vi.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        exams: [{ id: 'exam-a', title: 'Exam A', file: 'exams/exam-a.json', questions: 2, passages: 1, source: '' }],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        test_id: 'exam-a',
        title: 'Exam A',
        source_url: '',
        scraped_at: '',
        passages: { p1: { ja: '本文', en: 'text' } },
        questions: [
          { n: 1, id: 'q1', passage: null, stem: '一', opts: ['a'], correct: 0, category: 'Kanji Reading', expl: '' },
          { n: 2, id: 'q2', passage: null, stem: '二', opts: ['b'], correct: 0, category: 'Kanji Reading', expl: '' },
        ],
      }),
    }) as any;
});

describe('renderExam', () => {
  it('renders exam counts without leaking object strings', async () => {
    const root = document.createElement('div');
    await renderExam(root, 'exam-a');

    expect(root.textContent).toContain('2문제 · 1지문');
    expect(root.textContent).not.toContain('[object Object]');
  });
});
