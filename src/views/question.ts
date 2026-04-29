import { loadExam, loadVocab } from '../lib/data';
import { categoryKo } from '../lib/categories';
import { navigate } from '../router';
import { recordAnswer, setLast } from '../state';
import { buildIndex, matchVocab } from '../lib/vocab-match';
import { showPopover, hidePopover } from '../lib/popover';
import type { Exam, Question } from '../types';

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
  const vocab = await loadVocab();
  const idx = buildIndex(vocab);
  setLast(examId, n);

  root.innerHTML = `
    <header class="qhdr">
      <a href="#/exam/${examId}" class="back">← ${escape(exam.title)}</a>
      <div class="qmeta">문제 ${n} / ${max} (범위 ${min}–${max}) · ${categoryKo(q.category)}</div>
    </header>
    <main class="qmain">
      ${q.passage ? renderPassage(exam, q.passage, idx) : ''}
      <div class="stem">${q.stem ? renderJa(q.stem, idx) : '(빈칸 채우기 — 위 지문 참조)'}</div>
      <ol class="opts">
        ${q.opts.map((o, i) => `<li><button class="opt" data-i="${i}">${i + 1}. ${renderJa(o, idx)}</button></li>`).join('')}
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

  const optBtns = root.querySelectorAll<HTMLButtonElement>('.opt');
  const fb = root.querySelector<HTMLDivElement>('#feedback')!;

  optBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const picked = Number(btn.dataset.i);
      gradeAndShow(q, picked, optBtns, fb, examId);
    });
  });

  const keyHandler = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key >= '1' && e.key <= '4') {
      const i = Number(e.key) - 1;
      if (i < q.opts.length) optBtns[i]?.click();
    } else if (e.key === 'ArrowLeft' && n > min) {
      navigate({ name: 'question', examId, n: n - 1, from, to });
    } else if (e.key === 'ArrowRight' && n < max) {
      navigate({ name: 'question', examId, n: n + 1, from, to });
    }
  };
  document.addEventListener('keydown', keyHandler);
  const cleanup = () => document.removeEventListener('keydown', keyHandler);
  window.addEventListener('hashchange', cleanup, { once: true });

  const vocabMap = new Map(vocab.map((v) => [v.w, v]));
  root.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest('.vw') as HTMLElement | null;
    if (t) {
      e.stopPropagation();
      const w = t.dataset.w!;
      const v = vocabMap.get(w);
      if (v) showPopover(t, v);
    }
  });
  window.addEventListener('hashchange', hidePopover, { once: true });
}

function renderPassage(exam: Exam, pid: string, idx: ReturnType<typeof buildIndex>): string {
  const p = exam.passages[pid];
  if (!p) return '';
  return `<aside class="passage"><div class="ja">${renderJa(p.ja, idx)}</div></aside>`;
}

function renderJa(text: string, idx: ReturnType<typeof buildIndex>): string {
  return matchVocab(text, idx).map((s) =>
    s.entry
      ? `<span class="vw" data-w="${escape(s.entry.w)}">${escape(s.text)}</span>`
      : escape(s.text),
  ).join('');
}

function gradeAndShow(
  q: Question,
  picked: number,
  optBtns: NodeListOf<HTMLButtonElement>,
  fb: HTMLDivElement,
  examId: string,
) {
  const correct = picked === q.correct;
  recordAnswer(examId, q.n, picked, correct);

  optBtns.forEach((b, i) => {
    b.classList.remove('opt-picked', 'opt-correct', 'opt-wrong');
    if (i === q.correct) b.classList.add('opt-correct');
    else if (i === picked) b.classList.add('opt-wrong', 'opt-picked');
  });

  const verdict = correct ? '✓ 정답' : `✗ 오답 (정답: ${q.correct + 1}번)`;
  const expl = q.expl_ko ?? q.expl ?? '(해설 없음)';
  fb.innerHTML = `
    <div class="verdict ${correct ? 'ok' : 'no'}">${verdict}</div>
    <div class="expl">${escape(expl)}</div>
  `;
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
