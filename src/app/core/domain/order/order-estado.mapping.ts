import type { AdminOrderStatus } from '../admin-order/admin-order.model';

export type ApiPedidoEstado = 'pendiente' | 'en_camino' | 'entregado' | 'cancelado';

export function apiEstadoToAdminStatus(raw: string | undefined | null): AdminOrderStatus {
  const s = (raw ?? 'pendiente').trim().toLowerCase().replace(/\s+/g, '_');
  if (s === 'en_camino') {
    return 'on_the_way';
  }
  if (s === 'entregado') {
    return 'delivered';
  }
  if (s === 'cancelado') {
    return 'cancelled';
  }
  return 'pending';
}

export function adminStatusToApiEstado(status: AdminOrderStatus): ApiPedidoEstado {
  const m: Record<AdminOrderStatus, ApiPedidoEstado> = {
    pending: 'pendiente',
    on_the_way: 'en_camino',
    delivered: 'entregado',
    cancelled: 'cancelado',
  };
  return m[status];
}

export function apiEstadoToBuyerStatus(raw: string | undefined | null): 'pendiente' | 'en_camino' | 'entregado' | 'cancelado' {
  const s = (raw ?? 'pendiente').trim().toLowerCase().replace(/\s+/g, '_');
  if (s === 'en_camino') {
    return 'en_camino';
  }
  if (s === 'entregado') {
    return 'entregado';
  }
  if (s === 'cancelado') {
    return 'cancelado';
  }
  return 'pendiente';
}
