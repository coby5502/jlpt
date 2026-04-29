import { loadExam } from '../lib/data';
import { categoryKo } from '../lib/categories';
import { navigate } from '../router';
import { setLast } from '../state';
import type { Exam } from '../types';

export async function renderQuestion(
  root: HTMLElement,
  examId: string,
  n: number,
  from?: number,
  to?: number,
) {
  root.innerHTML = '<div class="loading">불러오는 중…</div>';
  const exam = await loadExam(examId);
  const q = exam.questions.find((x) => x.n === n);
  if (!q) { root.innerHTML = `<div class="error">문제 ${n}을 찾을 수 없습니다.</div>`; return; }

  const min = from ?? 1;
  const max = to ?? exam.questions.length;
  setLast(examId, n);

  root.innerHTML = `
    <header class="qhdr">
      <a href="#/exam/${examId}" class="back">← ${escape(exam.title)}</a>
      <div class="qmeta">문제 ${n} / ${max} (범위 ${min}–${max}) · ${categoryKo(q.category)}</div>
    </header>
    <main class="qmain">
      ${q.passage ? renderPassage(exam, q.passage) : ''}
      <div class="stem">${escape(q.stem || '(빈칸 채우기)')}</div>
      <ol class="opts">
        ${q.opts.map((o, i) => `<li><button class="opt" data-i="${i}">${i + 1}. ${escape(o)}</button></li>`).join('')}
      </ol>
      <div class="feedback" id="feedback"></div>
      <nav class="qnav">
        <button id="prev" ${n <= min ? 'disabled' : ''}>← 이전</button>
        <button id="next" ${n >= max ? 'disabled' : ''}>다음 →</button>
      </nav>
    </main>`;

  root.querySelector<HTMLButtonElement>('#prev')!.addEventListener('click', () => {
    if (n > min) navigate({ name: 'question', examId, n: n - 1, from, to });
  });
  root.querySelector<HTMLButtonElement>('#next')!.addEventListener('click', () => {
    if (n < max) navigate({ name: 'question', examId, n: n + 1, from, to });
  });
}

function renderPassage(exam: Exam, pid: string): string {
  const p = exam.passages[pid];
  if (!p) return '';
  return `<aside class="passage"><pre class="ja">${escape(p.ja)}</pre></aside>`;
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
