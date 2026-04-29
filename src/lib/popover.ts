import type { VocabEntry } from '../types';
import { escapeHtml } from './html';

let current: HTMLDivElement | null = null;

export function showPopover(near: HTMLElement, entry: VocabEntry) {
  hidePopover();
  const pop = document.createElement('div');
  pop.className = 'vocab-popover';
  pop.innerHTML = `
    <div class="vp-w">${escapeHtml(entry.w)}</div>
    <div class="vp-r">${escapeHtml(entry.r)}</div>
    <div class="vp-m">${escapeHtml(entry.m_ko ?? entry.m)}</div>
  `;
  document.body.appendChild(pop);
  const r = near.getBoundingClientRect();
  pop.style.top = `${r.bottom + window.scrollY + 6}px`;
  pop.style.left = `${Math.min(r.left + window.scrollX, window.innerWidth - 280)}px`;
  current = pop;

  const offClick = (e: MouseEvent) => {
    if (!pop.contains(e.target as Node) && e.target !== near) hidePopover();
  };
  setTimeout(() => document.addEventListener('click', offClick), 0);
  (pop as any)._off = () => document.removeEventListener('click', offClick);
}

export function hidePopover() {
  if (!current) return;
  (current as any)._off?.();
  current.remove();
  current = null;
}
