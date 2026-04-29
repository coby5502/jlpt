import { describe, it, expect } from 'vitest';
import { categoryKo, sectionLabelKo } from '../src/lib/categories';

describe('categoryKo', () => {
  it('translates known categories', () => {
    expect(categoryKo('Kanji Reading')).toBe('한자 읽기');
    expect(categoryKo('Sentential Grammar 1 (Selecting grammar form)')).toBe('문법 형식 판단');
    expect(categoryKo('Comprehension (Mid-size passages)')).toBe('중간 길이 독해');
  });
  it('falls back to original for unknown', () => {
    expect(categoryKo('Mystery Category')).toBe('Mystery Category');
  });
});

describe('sectionLabelKo', () => {
  it('returns 問題N + Korean label', () => {
    expect(sectionLabelKo(1, 'Kanji Reading')).toBe('問題1 한자 읽기');
  });
});
