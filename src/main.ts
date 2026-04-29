import { onRouteChange } from './router';
import { renderHome } from './views/home';

const root = document.getElementById('app')!;

onRouteChange(async (route) => {
  if (route.name === 'home') await renderHome(root);
  else root.innerHTML = `<pre>route: ${JSON.stringify(route)}</pre>`;
});
