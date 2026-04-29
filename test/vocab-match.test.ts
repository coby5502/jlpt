import { describe, it, expect } from 'vitest';
import { matchVocab } from '../src/lib/vocab-match';
import type { VocabEntry } from '../src/types';

const vocab: VocabEntry[] = [
  { w: '余暇', r: 'よか', m: 'leisure' },
  { w: '楽しみ', r: 'たのしみ', m: 'enjoyment' },
  { w: '方', r: 'ほう', m: 'way, side' },
];

describe('matchVocab', () => {
  it('finds longest matches greedily', () => {
    const r = matchVocab('余暇の楽しみ方はいろいろある。', vocab);
    const words = r.filter((s) => s.entry).map((s) => s.text);
    expect(words).toContain('余暇');
    expect(words).toContain('楽しみ');
  });

  it('returns plain segments for non-matches', () => {
    const r = matchVocab('XYZ', vocab);
    expect(r).toEqual([{ text: 'XYZ', entry: null }]);
  });

  it('handles empty input', () => {
    expect(matchVocab('', vocab)).toEqual([]);
  });
});
