/** Base del API para HttpClient; si no viene configurada, se asume desarrollo local. */
export function resolveApiBaseUrl(apiBaseUrl: string | null | undefined): string {
  const t = apiBaseUrl?.trim();
  if (t) {
    return t.replace(/\/$/, '');
  }
  return 'http://127.0.0.1:8000';
}
