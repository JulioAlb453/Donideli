import { Injectable, signal, computed } from '@angular/core';

export type BuyerOrderStatus = 'pendiente' | 'en_camino' | 'entregado' | 'cancelado';

export interface BuyerOrderLine {
  nombre_producto: string;
  cantidad: number;
  precio: number;
}

export interface BuyerOrder {
  id_pedido: string;
  fecha_creacion: string;
  fecha_entrega: string;
  horario_entrega: string;
  estado: BuyerOrderStatus;
  lineas: BuyerOrderLine[];
  nombre_colaborador: string;
  subtotal: number;
  costo_envio: number;
  total: number;
}

const MOCK_ORDERS: BuyerOrder[] = [
  {
    id_pedido: 'PED-001',
    fecha_creacion: '2026-04-14T10:30:00',
    fecha_entrega: '2026-04-16',
    horario_entrega: '09-12',
    estado: 'pendiente',
    nombre_colaborador: 'Mariana López',
    lineas: [
      { nombre_producto: 'Leche Santa Clara', cantidad: 2, precio: 15 },
      { nombre_producto: 'Glaseada Rosa', cantidad: 1, precio: 17 },
    ],
    subtotal: 47,
    costo_envio: 20,
    total: 67,
  },
  {
    id_pedido: 'PED-002',
    fecha_creacion: '2026-04-13T14:00:00',
    fecha_entrega: '2026-04-15',
    horario_entrega: '12-15',
    estado: 'en_camino',
    nombre_colaborador: 'Ana Ruiz',
    lineas: [
      { nombre_producto: 'Frappe de Vainilla', cantidad: 1, precio: 55 },
    ],
    subtotal: 55,
    costo_envio: 20,
    total: 75,
  },
  {
    id_pedido: 'PED-003',
    fecha_creacion: '2026-04-10T09:15:00',
    fecha_entrega: '2026-04-11',
    horario_entrega: '15-18',
    estado: 'entregado',
    nombre_colaborador: 'Luis Ortega',
    lineas: [
      { nombre_producto: 'Cookie Choco Chips', cantidad: 3, precio: 22 },
      { nombre_producto: 'Avena y Miel', cantidad: 2, precio: 20 },
    ],
    subtotal: 106,
    costo_envio: 20,
    total: 126,
  },
  {
    id_pedido: 'PED-004',
    fecha_creacion: '2026-04-08T16:45:00',
    fecha_entrega: '2026-04-09',
    horario_entrega: '18-20',
    estado: 'cancelado',
    nombre_colaborador: 'Mariana López',
    lineas: [
      { nombre_producto: 'Iced Latte', cantidad: 2, precio: 48 },
    ],
    subtotal: 96,
    costo_envio: 20,
    total: 116,
  },
];

@Injectable({ providedIn: 'root' })
export class BuyerOrdersService {
  private readonly pedidos = signal<BuyerOrder[]>([...MOCK_ORDERS]);

  readonly items = this.pedidos.asReadonly();

  readonly total_pedidos = computed(() => this.pedidos().length);

  cancelar(id_pedido: string): boolean {
    const list = this.pedidos();
    const idx = list.findIndex((p) => p.id_pedido === id_pedido);
    if (idx < 0) return false;
    const order = list[idx];
    if (order.estado === 'entregado' || order.estado === 'cancelado') return false;
    const next = [...list];
    next[idx] = { ...order, estado: 'cancelado' };
    this.pedidos.set(next);
    return true;
  }

  reagendar(id_pedido: string, nueva_fecha: string, nuevo_horario: string): boolean {
    const list = this.pedidos();
    const idx = list.findIndex((p) => p.id_pedido === id_pedido);
    if (idx < 0) return false;
    const order = list[idx];
    if (order.estado === 'entregado' || order.estado === 'cancelado') return false;
    const next = [...list];
    next[idx] = { ...order, fecha_entrega: nueva_fecha, horario_entrega: nuevo_horario };
    this.pedidos.set(next);
    return true;
  }

  etiqueta_estado(estado: BuyerOrderStatus): string {
    const map: Record<BuyerOrderStatus, string> = {
      pendiente: 'Pendiente',
      en_camino: 'En camino',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
    };
    return map[estado];
  }

  etiqueta_horario(horario: string): string {
    const map: Record<string, string> = {
      '09-12': 'Mañana (9:00 – 12:00)',
      '12-15': 'Mediodía (12:00 – 15:00)',
      '15-18': 'Tarde (15:00 – 18:00)',
      '18-20': 'Noche (18:00 – 20:00)',
    };
    return map[horario] ?? horario;
  }
}
