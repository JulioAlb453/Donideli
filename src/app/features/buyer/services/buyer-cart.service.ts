import { Injectable, computed, inject, signal } from '@angular/core';
import type { FlaticonIconName } from '../../../shared/ui/flaticon-icon/flaticon-icons.config';
import { NotificationService } from '../../../shared/services/notification.service';


export interface BuyerCartLine {
  lineId: string;
  id_colaborador: string;
  email_colaborador: string;
  id_producto: string;
  nombre: string;
  precio: number;
  cantidad: number;
  nombre_colaborador: string;
  icon: FlaticonIconName;
}

const STORAGE_KEY = 'donideli_buyer_cart_v2';

interface LegacyBuyerCartLine {
  lineId: string;
  productId?: string;
  id_producto?: string;
  name?: string;
  nombre?: string;
  priceMx?: number;
  precio?: number;
  quantity?: number;
  cantidad?: number;
  collaboratorName?: string;
  nombre_colaborador?: string;
  icon: FlaticonIconName;
}

@Injectable({ providedIn: 'root' })
export class BuyerCartService {
  private readonly notificacion = inject(NotificationService);
  private readonly lines = signal<BuyerCartLine[]>(this.loadFromStorage());

  readonly items = this.lines.asReadonly();

  readonly cantidad_items = computed(() =>
    this.lines().reduce((sum, line) => sum + line.cantidad, 0),
  );

  readonly subtotal = computed(() =>
    this.lines().reduce((sum, line) => sum + line.precio * line.cantidad, 0),
  );

  addProduct(input: {
    id_colaborador: string;
    email_colaborador: string;
    id_producto: string;
    nombre: string;
    precio: number;
    nombre_colaborador: string;
    icon: FlaticonIconName;
  }): void {
    const lineId = `${input.id_colaborador}-${input.id_producto}`;
    const current = this.lines();
    const idx = current.findIndex((l) => l.lineId === lineId);
    if (idx >= 0) {
      const next = [...current];
      next[idx] = { ...next[idx], cantidad: next[idx].cantidad + 1 };
      this.lines.set(next);
    } else {
      this.lines.set([
        ...current,
        {
          lineId,
          id_colaborador: input.id_colaborador,
          email_colaborador: input.email_colaborador,
          id_producto: input.id_producto,
          nombre: input.nombre,
          precio: input.precio,
          cantidad: 1,
          nombre_colaborador: input.nombre_colaborador,
          icon: input.icon,
        },
      ]);
    }
    this.persist();
    this.notificacion.producto_agregado_al_carrito(input.nombre);
  }

  setQuantity(lineId: string, cantidad: number): void {
    if (cantidad < 1) {
      this.removeLine(lineId);
      return;
    }
    const next = this.lines().map((l) =>
      l.lineId === lineId ? { ...l, cantidad } : l,
    );
    this.lines.set(next);
    this.persist();
  }

  increment(lineId: string, delta: number): void {
    const line = this.lines().find((l) => l.lineId === lineId);
    if (!line) {
      return;
    }
    this.setQuantity(lineId, line.cantidad + delta);
  }

  removeLine(lineId: string): void {
    this.lines.set(this.lines().filter((l) => l.lineId !== lineId));
    this.persist();
  }

  clear(): void {
    this.lines.set([]);
    this.persist();
  }

  private loadFromStorage(): BuyerCartLine[] {
    if (typeof sessionStorage === 'undefined') {
      return [];
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BuyerCartLine[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      const legacyRaw = sessionStorage.getItem('donideli_buyer_cart_v1');
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as LegacyBuyerCartLine[];
        const migrated = Array.isArray(legacy) ? legacy.map(normalizeLegacyLine) : [];
        if (migrated.length > 0) {
          sessionStorage.removeItem('donideli_buyer_cart_v1');
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }
    } catch {
      return [];
    }
    return [];
  }

  private persist(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.lines()));
    } catch {
    }
  }
}

function normalizeLegacyLine(row: LegacyBuyerCartLine): BuyerCartLine {
  const r = row as unknown as Record<string, unknown>;
  return {
    lineId: row.lineId,
    id_colaborador: (r['id_colaborador'] as string) ?? '',
    email_colaborador: (r['email_colaborador'] as string) ?? '',
    id_producto: row.id_producto ?? row.productId ?? '',
    nombre: row.nombre ?? row.name ?? '',
    precio: row.precio ?? row.priceMx ?? 0,
    cantidad: row.cantidad ?? row.quantity ?? 1,
    nombre_colaborador: row.nombre_colaborador ?? row.collaboratorName ?? '',
    icon: row.icon,
  };
}
