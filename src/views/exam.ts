import { loadExam } from '../lib/data';
import { sectionLabelKo } from '../lib/categories';
import { navigate } from '../router';
import type { Question } from '../types';

export async function renderExam(root: HTMLElement, examId: string) {
  root.innerHTML = '<div class="loading">불러오는 중…</div>';
  const exam = await loadExam(examId);
  const sections = groupBySection(exam.questions);

  const sectionHtml = sections.map((s, i) => `
    <li class="sec" data-from="${s.from}" data-to="${s.to}">
      <span class="sec-label">${sectionLabelKo(i + 1, s.category)}</span>
      <span class="sec-range">[${s.from}–${s.to}]</span>
      <span class="sec-count">${s.to - s.from + 1}문제</span>
    </li>`).join('');

  root.innerHTML = `
    <header class="hero">
      <a href="#/" class="back">← 회차 목록</a>
      <h1>${escape(exam.title)}</h1>
    </header>
    <main class="exam-main">
      <h2>섹션 선택</h2>
      <ul class="sections">${sectionHtml}</ul>
      <h2>또는 직접 범위</h2>
      <div class="range-pick">
        <label>From <input type="number" id="from" min="1" max="${exam.questions.length}" value="1" /></label>
        <label>To <input type="number" id="to" min="1" max="${exam.questions.length}" value="${exam.questions.length}" /></label>
        <button id="go">시작</button>
      </div>
    </main>`;

  root.querySelectorAll<HTMLLIElement>('.sec').forEach((li) => {
    li.addEventListener('click', () => {
      const from = Number(li.dataset.from);
      const to = Number(li.dataset.to);
      navigate({ name: 'question', examId, n: from, from, to });
    });
  });

  root.querySelector<HTMLButtonElement>('#go')!.addEventListener('click', () => {
    const fromEl = root.querySelector<HTMLInputElement>('#from')!;
    const toEl = root.querySelector<HTMLInputElement>('#to')!;
    const max = exam.questions.length;
    const from = Number(fromEl.value);
    const to = Number(toEl.value);
    if (!Number.isFinite(from) || !Number.isFinite(to) || from < 1 || to > max || from > to) return;
    navigate({ name: 'question', examId, n: from, from, to });
  });
}

interface Section { category: string; from: number; to: number }

function groupBySection(qs: Question[]): Section[] {
  const out: Section[] = [];
  for (const q of qs) {
    const last = out[out.length - 1];
    if (last && last.category === q.category) last.to = q.n;
    else out.push({ category: q.category, from: q.n, to: q.n });
  }
  return out;
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
