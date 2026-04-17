import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { API_BASE_URL } from '../../config/api-base-url.token';
import {
  type MenuProduct,
  type ProductoListApiRow,
  mapApiRowToMenuProduct,
} from './product-catalog.mapper';

@Injectable({ providedIn: 'root' })
export class ProductCatalogApiRepository {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiBaseUrl: string,
  ) {}

  /** Menú público del colaborador: `GET /colaboradores/{id}/productos`. */
  findMenuForCollaborator(colaboradorId: string | null): Observable<MenuProduct[]> {
    if (!colaboradorId) {
      return of([]);
    }
    const url = `${this.apiBaseUrl}/colaboradores/${encodeURIComponent(colaboradorId)}/productos`;
    return this.http.get<ProductoListApiRow[]>(url).pipe(
      map((rows) => (Array.isArray(rows) ? rows.map(mapApiRowToMenuProduct) : [])),
      catchError(() => of([])),
    );
  }
}
