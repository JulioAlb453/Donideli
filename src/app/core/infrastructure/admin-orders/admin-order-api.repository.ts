import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { API_BASE_URL } from '../../config/api-base-url.token';
import { AdminOrderRepositoryPort } from '../../domain/admin-order/admin-order.repository.port';
import type { AdminOrder, AdminOrderStatus } from '../../domain/admin-order/admin-order.model';
import { adminStatusToApiEstado, apiEstadoToAdminStatus } from '../../domain/order/order-estado.mapping';

interface ApiPedidoLinea {
  nombre_producto?: string;
  cantidad?: number;
}

interface ApiPedidoAdminRow {
  id_pedido: number;
  fecha: string;
  precio_total: number;
  metodo_pago: string;
  estado?: string;
  id_comprador: number;
  comprador_nombre?: string;
  lineas?: ApiPedidoLinea[];
}

interface ApiHistorialAdminResponse {
  pedidos?: ApiPedidoAdminRow[];
  cantidad_pedidos?: number;
}

function mapApiRowToAdminOrder(row: ApiPedidoAdminRow): AdminOrder {
  const lineas = Array.isArray(row.lineas) ? row.lineas : [];
  const items = lineas.map((ln) => ({
    productName: (ln.nombre_producto ?? 'Producto').trim() || 'Producto',
    quantity: typeof ln.cantidad === 'number' && ln.cantidad > 0 ? ln.cantidad : 1,
  }));
  const fechaRaw = row.fecha?.trim() ?? '';
  const createdAtIso = (() => {
    if (!fechaRaw) {
      return new Date().toISOString();
    }
    const d = new Date(fechaRaw);
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  })();
  const customerName = (row.comprador_nombre ?? '').trim() || `Comprador #${row.id_comprador}`;
  return {
    id: String(row.id_pedido),
    customerName,
    customerPhone: '—',
    collaboratorName: 'Catálogo',
    items,
    totalMx: Math.round(Number(row.precio_total) || 0),
    createdAtIso,
    status: apiEstadoToAdminStatus(row.estado),
    paymentMethod: (row.metodo_pago ?? '').trim() || '—',
  };
}

function mensajeErrorHttp(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { detail?: string };
    if (typeof body?.detail === 'string') {
      return body.detail;
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }
  }
  return 'No se pudo actualizar el estado.';
}

@Injectable()
export class AdminOrderApiRepository extends AdminOrderRepositoryPort {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiBaseUrl: string,
  ) {
    super();
  }

  findAll(): Observable<AdminOrder[]> {
    const url = `${this.apiBaseUrl.replace(/\/$/, '')}/pedidos/admin/historial`;
    return this.http.get<ApiHistorialAdminResponse>(url).pipe(
      map((body) => {
        const rows = body?.pedidos;
        return Array.isArray(rows) ? rows.map(mapApiRowToAdminOrder) : [];
      }),
      catchError(() => of([])),
    );
  }

  updateStatus(id: string, status: AdminOrderStatus): Observable<void> {
    const base = this.apiBaseUrl.replace(/\/$/, '');
    const estado = adminStatusToApiEstado(status);
    const url = `${base}/pedidos/admin/${encodeURIComponent(id)}/estado`;
    return this.http.patch(url, { estado }).pipe(
      map(() => undefined),
      catchError((e) => throwError(() => new Error(mensajeErrorHttp(e)))),
    );
  }
}
