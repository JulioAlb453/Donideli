const STORAGE_KEY = 'donideli.buyer.postulacionAlertDismissed';

export function readPostulacionAlertDismissed(): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(STORAGE_KEY);
}

export function writePostulacionAlertDismissed(id: number, estado: string): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, `${id}:${estado.toLowerCase()}`);
}
