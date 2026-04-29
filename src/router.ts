export type Route =
  | { name: 'home' }
  | { name: 'exam'; examId: string }
  | { name: 'question'; examId: string; n: number; from?: number; to?: number };

export function parseRoute(hash: string): Route {
  const m = hash.replace(/^#?\/?/, '');
  if (!m) return { name: 'home' };
  const [path, search] = m.split('?');
  const params = new URLSearchParams(search ?? '');
  const parts = path.split('/');
  if (parts[0] === 'exam' && parts[1]) {
    if (parts[2] === 'q' && parts[3]) {
      const route: Route = { name: 'question', examId: parts[1], n: Number(parts[3]) };
      const from = params.get('from'); const to = params.get('to');
      if (from) (route as any).from = Number(from);
      if (to) (route as any).to = Number(to);
      return route;
    }
    return { name: 'exam', examId: parts[1] };
  }
  return { name: 'home' };
}

export function navigate(route: Route) {
  let hash = '#/';
  if (route.name === 'exam') hash = `#/exam/${route.examId}`;
  else if (route.name === 'question') {
    hash = `#/exam/${route.examId}/q/${route.n}`;
    const params: string[] = [];
    if (route.from != null) params.push(`from=${route.from}`);
    if (route.to != null) params.push(`to=${route.to}`);
    if (params.length) hash += `?${params.join('&')}`;
  }
  location.hash = hash;
}

export function onRouteChange(cb: (r: Route) => void) {
  const handler = () => cb(parseRoute(location.hash));
  window.addEventListener('hashchange', handler);
  handler();
}
