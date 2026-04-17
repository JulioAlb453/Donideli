import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';

export interface ColaboradorRegistroPayload {
  email: string;
  display_name: string;
  handle: string;
  bio: string | null;
  specialty: string;
  product_count: number;
  sales_count: number;
  is_online: boolean;
  status: string;
}

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

  async registrarColaborador(
    payload: ColaboradorRegistroPayload,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    if (!this.tieneApi) {
      return { ok: false, message: 'Conecta el API (DONIDELI_API_BASE_URL) para registrarte.' };
    }
    const url = `${this.apiBaseUrl.replace(/\/$/, '')}/colaboradores/`;
    try {
      await firstValueFrom(this.http.post(url, payload));
      return { ok: true };
    } catch (e) {
      return { ok: false, message: mensajeErrorApi(e) };
    }
  }
}
