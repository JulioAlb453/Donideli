import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../../config/api-base-url.token';
import { AUTH_SESSION_STORAGE_KEY } from '../../application/auth/auth-session.storage';

export const authApiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = inject(API_BASE_URL);
  if (!apiBase || !req.url.startsWith(apiBase)) {
    return next(req);
  }
  if (typeof sessionStorage === 'undefined') {
    return next(req);
  }
  const raw = sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!raw) {
    return next(req);
  }
  try {
    const parsed = JSON.parse(raw) as { accessToken?: string };
    const token = parsed.accessToken;
    if (token) {
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
    }
  } catch {
    /* sesión inválida */
  }
  return next(req);
};
