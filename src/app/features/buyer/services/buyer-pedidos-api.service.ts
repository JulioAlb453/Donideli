import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import { apiEstadoToBuyerStatus } from '../../../core/domain/order/order-estado.mapping';
import type { BuyerOrder, BuyerOrderLine } from './buyer-orders.service';

interface ApiPedidoLinea {
  nombre_producto?: string;
  cantidad?: number;
  precio_unitario?: number;
  subtotal?: number;
}

interface ApiPedidoRow {
  id_pedido: number;
  fecha: string;
  precio_total: number;
  metodo_pago?: string;
  estado?: string;
  lineas?: ApiPedidoLinea[];
}

interface ApiHistorialResponse {
  pedidos?: ApiPedidoRow[];
}

function mapApiRowToBuyerOrder(row: ApiPedidoRow): BuyerOrder {
  const lineasRaw = Array.isArray(row.lineas) ? row.lineas : [];
  const lineas: BuyerOrderLine[] = lineasRaw.map((ln) => {
    const cant = typeof ln.cantidad === 'number' && ln.cantidad > 0 ? ln.cantidad : 1;
    const unit =
      typeof ln.precio_unitario === 'number'
        ? ln.precio_unitario
        : typeof ln.subtotal === 'number'
          ? ln.subtotal / cant
          : 0;
    return {
      nombre_producto: (ln.nombre_producto ?? 'Producto').trim() || 'Producto',
      cantidad: cant,
      precio: unit,
    };
  });
  const fechaRaw = row.fecha?.trim() ?? '';
  const fechaCreacion = (() => {
    if (!fechaRaw) return new Date().toISOString();
    const d = new Date(fechaRaw);
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  })();
  const fechaSolo = fechaCreacion.slice(0, 10);
  const total = Math.round(Number(row.precio_total) || 0);
  return {
    id_pedido: `API-${row.id_pedido}`,
    id_colaborador: '',
    email_colaborador: '',
    fecha_creacion: fechaCreacion,
    fecha_entrega: fechaSolo,
    horario_entrega: '09-12',
    estado: apiEstadoToBuyerStatus(row.estado),
    lineas,
    nombre_colaborador: 'DoniDeli',
    subtotal: total,
    costo_envio: 0,
    total,
  };
}

@Injectable({ providedIn: 'root' })
export class BuyerPedidosApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  fetchHistorial(): Observable<BuyerOrder[]> {
    const base = this.apiBaseUrl.replace(/\/$/, '');
    return this.http.get<ApiHistorialResponse>(`${base}/pedidos/historial`).pipe(
      map((body) => {
        const rows = body?.pedidos;
        return Array.isArray(rows) ? rows.map(mapApiRowToBuyerOrder) : [];
      }),
      catchError(() => of([])),
    );
  }

  cancelarPedido(idPedidoNumerico: number): Observable<void> {
    const base = this.apiBaseUrl.replace(/\/$/, '');
    return this.http
      .patch(`${base}/pedidos/mi-pedido/${encodeURIComponent(String(idPedidoNumerico))}/cancelar`, {})
      .pipe(map(() => undefined));
  }
}
