import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';

export interface BuyerMiPostulacionColaborador {
  id: number;
  id_comprador?: number | null;
  nombre_completo: string;
  email: string;
  telefono: string;
  specialty: string;
  mensaje: string | null;
  estado: string;
  creado_en: string;
}

@Injectable({ providedIn: 'root' })
export class BuyerMiPostulacionApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  fetchMiPostulacion(): Observable<BuyerMiPostulacionColaborador | null> {
    const base = this.apiBaseUrl.replace(/\/$/, '');
    return this.http.get<{ postulacion: BuyerMiPostulacionColaborador | null }>(
      `${base}/compradores/mi-postulacion-colaborador`,
    ).pipe(
      map((body) => body?.postulacion ?? null),
      catchError(() => of(null)),
    );
  }
}
