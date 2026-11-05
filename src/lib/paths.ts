/** Join the site base URL (e.g. `/portfolio/`) with a path, with exactly one `/` between. */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '')}`;
}
