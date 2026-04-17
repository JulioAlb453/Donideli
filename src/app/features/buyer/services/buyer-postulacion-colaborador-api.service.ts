import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';

export type SpecialtyPostulacion = 'donas' | 'galletas' | 'bebidas';

export interface PostulacionColaboradorCreatePayload {
  nombre_completo: string;
  email: string;
  telefono: string;
  specialty: SpecialtyPostulacion;
  mensaje?: string | null;
}

export interface PostulacionColaboradorCreateResponse {
  id: number;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class BuyerPostulacionColaboradorApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  enviar(payload: PostulacionColaboradorCreatePayload): Observable<PostulacionColaboradorCreateResponse> {
    const base = this.apiBaseUrl.replace(/\/$/, '');
    const body: PostulacionColaboradorCreatePayload = {
      ...payload,
      mensaje: payload.mensaje?.trim() ? payload.mensaje.trim() : undefined,
    };
    return this.http.post<PostulacionColaboradorCreateResponse>(
      `${base}/colaboradores/postulaciones`,
      body,
    );
  }
}
