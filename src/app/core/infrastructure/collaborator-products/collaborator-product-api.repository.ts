import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../config/api-base-url.token';
import { AdminProductRepositoryPort } from '../../domain/admin-product/admin-product.repository.port';
import type {
  AdminProduct,
  AdminProductCreateBody,
  AdminProductUpdateBody,
} from '../../domain/admin-product/admin-product.model';
import { type ProductoListApiRow, mapApiRowToAdminProduct } from '../productos/product-catalog.mapper';

function mensajeErrorHttp(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { detail?: string | { msg?: string }[] };
    if (typeof body?.detail === 'string') {
      return body.detail;
    }
    if (Array.isArray(body?.detail)) {
      return (
        body.detail.map((x) => (typeof x === 'object' && x && 'msg' in x ? String(x.msg) : '')).filter(Boolean).join('. ') ||
        'Solicitud inválida.'
      );
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }
  }
  return 'No se pudo completar la operación.';
}

/** Endpoints de productos para sesión `collaborator` (JWT). */
@Injectable()
export class CollaboratorProductApiRepository extends AdminProductRepositoryPort {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiBaseUrl: string,
  ) {
    super();
  }

  findAll(): Observable<AdminProduct[]> {
    const url = `${this.apiBaseUrl}/colaboradores/mis-productos`;
    return this.http.get<ProductoListApiRow[]>(url).pipe(
      map((rows) => (Array.isArray(rows) ? rows.map(mapApiRowToAdminProduct) : [])),
      catchError((e) => throwError(() => new Error(mensajeErrorHttp(e)))),
    );
  }

  create(body: AdminProductCreateBody): Observable<void> {
    const url = `${this.apiBaseUrl}/productos/colaborador`;
    const payload = {
      nombre: body.nombre,
      precio: body.precio,
      categoria: body.categoria,
      stock_disponible: body.stock_disponible,
    };
    return this.http.post(url, payload).pipe(
      map(() => undefined),
      catchError((e) => throwError(() => new Error(mensajeErrorHttp(e)))),
    );
  }

  update(id: string, body: AdminProductUpdateBody): Observable<void> {
    const url = `${this.apiBaseUrl}/productos/${encodeURIComponent(id)}/colaborador`;
    return this.http.put(url, body).pipe(
      map(() => undefined),
      catchError((e) => throwError(() => new Error(mensajeErrorHttp(e)))),
    );
  }

  delete(id: string): Observable<void> {
    const url = `${this.apiBaseUrl}/productos/${encodeURIComponent(id)}/colaborador`;
    return this.http.delete(url).pipe(
      map(() => undefined),
      catchError((e) => throwError(() => new Error(mensajeErrorHttp(e)))),
    );
  }
}
