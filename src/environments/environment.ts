declare const __DONIDELI_PRODUCTION__: boolean;
declare const __DONIDELI_API_BASE_URL__: string;
declare const __DONIDELI_WS_COLLABORATION_ORIGIN__: string;

const LOCAL_DEFAULTS = {
  production: false,
  apiBaseUrl: 'http://127.0.0.1:8000',
  wsCollaborationOrigin: 'http://127.0.0.1:8080',
} as const;

export const environment = (() => {
  try {
    return {
      production: __DONIDELI_PRODUCTION__,
      apiBaseUrl: __DONIDELI_API_BASE_URL__,
      wsCollaborationOrigin: __DONIDELI_WS_COLLABORATION_ORIGIN__,
    };
  } catch {
    return { ...LOCAL_DEFAULTS };
  }
})();

export function collaborationTokenUrl(origin: string): string {
  const base = origin.replace(/\/+$/, '');
  return `${base}/auth/token`;
}


export function collaborationWsUrl(origin: string): string {
  const base = origin.replace(/\/+$/, '');
  if (base.startsWith('https://')) {
    return `wss://${base.slice('https://'.length)}/ws`;
  }
  if (base.startsWith('http://')) {
    return `ws://${base.slice('http://'.length)}/ws`;
  }
  return `wss://${base}/ws`;
}
