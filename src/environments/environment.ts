/**
 * Con `pnpm serve` / `node scripts/run-ng.mjs serve`, Angular recibe --define y sustituye
 * las constantes en el bundle. Si ejecutas `ng serve` solo, no existen y usamos estos defaults.
 */
declare const __DONIDELI_PRODUCTION__: boolean;
declare const __DONIDELI_API_BASE_URL__: string;
declare const __DONIDELI_WS_COLLABORATION_HOST__: string;

const LOCAL_DEFAULTS = {
  production: false,
  apiBaseUrl: 'http://127.0.0.1:8000',
  wsCollaborationHost: 'wb-donideli.fly.dev',
} as const;

export const environment = (() => {
  try {
    return {
      production: __DONIDELI_PRODUCTION__,
      apiBaseUrl: __DONIDELI_API_BASE_URL__,
      wsCollaborationHost: __DONIDELI_WS_COLLABORATION_HOST__,
    };
  } catch {
    return { ...LOCAL_DEFAULTS };
  }
})();
