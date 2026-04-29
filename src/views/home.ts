import { loadIndex } from '../lib/data';
import { escapeHtml } from '../lib/html';
import { getProgress, getLast } from '../state';

export async function renderHome(root: HTMLElement) {
  root.innerHTML = '<div class="loading">불러오는 중…</div>';
  const idx = await loadIndex();
  const last = getLast();

  const cards = idx.exams.map((e) => {
    const prog = getProgress(e.id);
    const answered = Object.keys(prog).length;
    const correct = Object.values(prog).filter((p) => p.correct).length;
    return `
      <a class="card" href="#/exam/${e.id}">
        <div class="card-title">${escapeHtml(e.title)}</div>
        <div class="card-meta">${e.questions}문제 · ${e.passages}지문</div>
        <div class="card-prog">${answered}/${e.questions} 답함${answered ? ` · 정답 ${correct}` : ''}</div>
      </a>`;
  }).join('');

  const resume = last
    ? `<a class="resume" href="#/exam/${last.examId}/q/${last.questionN}">↪ 마지막 위치로 이어서 (${last.examId} · 문제 ${last.questionN})</a>`
    : '';

  root.innerHTML = `
    <header class="hero">
      <h1>JLPT N1 모의고사</h1>
      ${resume}
    </header>
    <div class="cards">${cards}</div>`;
}
