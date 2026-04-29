import { onRouteChange } from './router';
import { renderHome } from './views/home';
import { renderExam } from './views/exam';
import { renderQuestion } from './views/question';

const root = document.getElementById('app')!;

onRouteChange(async (route) => {
  if (route.name === 'home') await renderHome(root);
  else if (route.name === 'exam') await renderExam(root, route.examId);
  else if (route.name === 'question') await renderQuestion(root, route.examId, route.n, route.from, route.to);
});
