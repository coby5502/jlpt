import { describe, it, expect } from 'vitest';
import { parseRoute } from '../src/router';

describe('parseRoute', () => {
  it('home', () => {
    expect(parseRoute('#/')).toEqual({ name: 'home' });
    expect(parseRoute('')).toEqual({ name: 'home' });
  });
  it('exam', () => {
    expect(parseRoute('#/exam/n1_2025-07')).toEqual({ name: 'exam', examId: 'n1_2025-07' });
  });
  it('question with from/to', () => {
    expect(parseRoute('#/exam/n1_2025-07/q/3?from=1&to=6')).toEqual({
      name: 'question', examId: 'n1_2025-07', n: 3, from: 1, to: 6,
    });
  });
  it('question without range', () => {
    expect(parseRoute('#/exam/x/q/10')).toEqual({ name: 'question', examId: 'x', n: 10 });
  });
  it('falls back to home for non-numeric question n', () => {
    expect(parseRoute('#/exam/x/q/abc')).toEqual({ name: 'home' });
  });
  it('falls back to home for unrecognized path', () => {
    expect(parseRoute('#/garbage')).toEqual({ name: 'home' });
  });
});
