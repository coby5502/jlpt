import { describe, it, expect, beforeEach } from 'vitest';
import { recordAnswer, getProgress, setLast, getLast, getSettings, setSettings } from '../src/state';

beforeEach(() => localStorage.clear());

describe('state', () => {
  it('records and retrieves answers', () => {
    recordAnswer('exam-a', 1, 2, true);
    const p = getProgress('exam-a');
    expect(p[1]).toMatchObject({ picked: 2, correct: true });
    expect(typeof p[1].ts).toBe('number');
  });

  it('last position roundtrip', () => {
    setLast('exam-b', 5);
    expect(getLast()).toMatchObject({ examId: 'exam-b', questionN: 5 });
  });

  it('settings default + roundtrip', () => {
    expect(getSettings()).toEqual({ furigana: false, dark: false });
    setSettings({ furigana: true });
    expect(getSettings().furigana).toBe(true);
    expect(getSettings().dark).toBe(false);
  });
});
