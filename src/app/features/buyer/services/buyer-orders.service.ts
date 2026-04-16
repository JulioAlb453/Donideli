import { Injectable, signal, computed } from '@angular/core';

export type BuyerOrderStatus = 'pendiente' | 'en_camino' | 'entregado' | 'cancelado';

export interface BuyerOrderLine {
  nombre_producto: string;
  cantidad: number;
  precio: number;
}

export interface BuyerOrder {
  id_pedido: string;
  id_colaborador: string;
  email_colaborador: string;
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

const STORAGE_KEY = 'donideli_buyer_orders';
const COSTO_ENVIO_DEFAULT = 20;

@Injectable({ providedIn: 'root' })
export class BuyerOrdersService {
  private readonly pedidos = signal<BuyerOrder[]>(this.loadFromStorage());

  readonly items = this.pedidos.asReadonly();
  readonly total_pedidos = computed(() => this.pedidos().length);

  crear_pedido(input: {
    id_colaborador: string;
    email_colaborador: string;
    nombre_colaborador: string;
    fecha_entrega: string;
    horario_entrega: string;
    lineas: BuyerOrderLine[];
  }): BuyerOrder {
    const subtotal = input.lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
    const pedido: BuyerOrder = {
      id_pedido: this.generarId(),
      id_colaborador: input.id_colaborador,
      email_colaborador: input.email_colaborador,
      fecha_creacion: new Date().toISOString(),
      fecha_entrega: input.fecha_entrega,
      horario_entrega: input.horario_entrega,
      estado: 'pendiente',
      lineas: input.lineas,
      nombre_colaborador: input.nombre_colaborador,
      subtotal,
      costo_envio: COSTO_ENVIO_DEFAULT,
      total: subtotal + COSTO_ENVIO_DEFAULT,
    };

    this.pedidos.update((prev) => [pedido, ...prev]);
    this.persist();
    return pedido;
  }

  cancelar(id_pedido: string): boolean {
    const list = this.pedidos();
    const idx = list.findIndex((p) => p.id_pedido === id_pedido);
    if (idx < 0) return false;
    const order = list[idx];
    if (order.estado === 'entregado' || order.estado === 'cancelado') return false;
    const next = [...list];
    next[idx] = { ...order, estado: 'cancelado' };
    this.pedidos.set(next);
    this.persist();
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
    this.persist();
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

  private loadFromStorage(): BuyerOrder[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pedidos()));
    } catch { /* storage full */ }
  }

  private generarId(): string {
    const num = Math.floor(Math.random() * 900000) + 100000;
    return `PED-${num}`;
  }
}
