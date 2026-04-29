import type { Segment } from './vocab-match';

export function withFurigana(segments: Segment[]): string {
  return segments.map((s) => {
    if (s.entry) {
      const w = escapeHtml(s.entry.w);
      const r = escapeHtml(s.entry.r);
      return `<span class="vw" data-w="${escapeHtml(s.entry.w)}"><ruby>${w}<rt>${r}</rt></ruby></span>`;
    }
    return escapeHtml(s.text);
  }).join('');
}

export function withoutFurigana(segments: Segment[]): string {
  return segments.map((s) =>
    s.entry
      ? `<span class="vw" data-w="${escapeHtml(s.entry.w)}">${escapeHtml(s.text)}</span>`
      : escapeHtml(s.text),
  ).join('');
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
