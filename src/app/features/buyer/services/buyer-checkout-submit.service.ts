import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import type { BuyerCartLine } from './buyer-cart.service';

function mensajeHttp(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { detail?: string | { msg?: string }[] };
    if (typeof body?.detail === 'string') {
      return body.detail;
    }
    if (Array.isArray(body?.detail)) {
      return (
        body.detail
          .map((x) => (typeof x === 'object' && x && 'msg' in x ? String((x as { msg?: string }).msg) : ''))
          .filter(Boolean)
          .join('. ') || 'Solicitud inválida.'
      );
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }
    if (err.status === 401 || err.status === 403) {
      return 'Tu sesión no permite registrar el pedido. Inicia sesión como comprador.';
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'No se pudo completar el pedido.';
}

@Injectable({ providedIn: 'root' })
export class BuyerCheckoutSubmitService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  /**
   * Vacía el carrito del API, vuelca las líneas locales y crea el pedido en base de datos.
   */
  async enviarPedidoDesdeCarrito(
    lineas: BuyerCartLine[],
    metodoPago: string,
  ): Promise<{ id_pedido: number }> {
    const base = this.apiBaseUrl.replace(/\/$/, '');

    try {
      await lastValueFrom(this.http.delete(`${base}/carrito/vaciar`));
    } catch {
      /* sin carrito previo u offline parcial */
    }

    try {
      for (const line of lineas) {
        const id = parseInt(line.id_producto, 10);
        if (!Number.isFinite(id) || id < 1) {
          throw new Error(`ID de producto inválido: ${line.id_producto}`);
        }
        await lastValueFrom(
          this.http.post(`${base}/carrito/agregar`, {
            id_producto: id,
            cantidad: line.cantidad,
          }),
        );
      }
      const res = await lastValueFrom(
        this.http.post<{ id_pedido?: number }>(`${base}/pedidos/`, {
          metodo_pago: metodoPago,
        }),
      );
      if (typeof res?.id_pedido !== 'number') {
        throw new Error('Respuesta de pedido inválida.');
      }
      return { id_pedido: res.id_pedido };
    } catch (e) {
      try {
        await lastValueFrom(this.http.delete(`${base}/carrito/vaciar`));
      } catch {
        /* ignore */
      }
      throw new Error(mensajeHttp(e));
    }
  }
}
