import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';

function mensajeErrorApi(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as {
      detail?: string | { msg?: string }[];
      error?: { message?: string };
    };
    if (typeof body?.detail === 'string') {
      return body.detail;
    }
    if (Array.isArray(body?.detail)) {
      return body.detail.map((x) => (typeof x === 'object' && x && 'msg' in x ? String(x.msg) : '')).filter(Boolean).join('. ') || 'Datos inválidos.';
    }
    if (typeof body?.error?.message === 'string') {
      return body.error.message;
    }
  }
  return 'No se pudo completar el registro. Intenta de nuevo.';
}

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  get tieneApi(): boolean {
    return Boolean(this.apiBaseUrl?.trim());
  }

  async registrarComprador(
    nombre: string,
    contrasena: string,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    if (!this.tieneApi) {
      return { ok: false, message: 'Conecta el API (DONIDELI_API_BASE_URL) para registrarte.' };
    }
    const url = `${this.apiBaseUrl.replace(/\/$/, '')}/compradores/registro`;
    try {
      await firstValueFrom(
        this.http.post(url, { nombre: nombre.trim(), contrasena }),
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, message: mensajeErrorApi(e) };
    }
  }

  async registrarAdmin(
    nombre: string,
    contrasena: string,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    if (!this.tieneApi) {
      return { ok: false, message: 'Conecta el API (DONIDELI_API_BASE_URL) para registrarte.' };
    }
    const url = `${this.apiBaseUrl.replace(/\/$/, '')}/admins/registro`;
    try {
      await firstValueFrom(
        this.http.post(url, { nombre: nombre.trim(), contrasena }),
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, message: mensajeErrorApi(e) };
    }
  }


  async activarCuentaColaborador(
    email: string,
    contrasena: string,
    handle?: string,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    if (!this.tieneApi) {
      return { ok: false, message: 'Conecta el API (DONIDELI_API_BASE_URL) para registrarte.' };
    }
    const url = `${this.apiBaseUrl.replace(/\/$/, '')}/colaboradores/activar-cuenta`;
    const body: { email: string; contrasena: string; handle?: string } = {
      email: email.trim().toLowerCase(),
      contrasena,
    };
    const h = handle?.trim();
    if (h) {
      body.handle = h.startsWith('@') ? h : `@${h.replace(/^@+/, '')}`;
    }
    try {
      await firstValueFrom(this.http.post(url, body));
      return { ok: true };
    } catch (e) {
      return { ok: false, message: mensajeErrorApi(e) };
    }
  }
}
