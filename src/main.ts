import { onRouteChange } from './router';
import { renderHome } from './views/home';
import { renderExam } from './views/exam';

const root = document.getElementById('app')!;

onRouteChange(async (route) => {
  if (route.name === 'home') await renderHome(root);
  else if (route.name === 'exam') await renderExam(root, route.examId);
  else root.innerHTML = `<pre>route: ${JSON.stringify(route)}</pre>`;
});
