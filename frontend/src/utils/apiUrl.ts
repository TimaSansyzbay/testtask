/**
 * Builds the full API URL for a path.
 * - VITE_API_URL should be the server origin only (e.g. http://localhost:3001), not .../api
 * - In dev, leave VITE_API_URL empty to use Vite proxy (/api → backend)
 */
export function resolveApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let base = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '');

  if (base.endsWith('/api') && normalizedPath.startsWith('/api')) {
    base = base.slice(0, -4);
  }

  if (!base) {
    return normalizedPath;
  }

  return `${base}${normalizedPath}`;
}
