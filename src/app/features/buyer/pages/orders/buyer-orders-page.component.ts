import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { catchError, interval, of, startWith, switchMap } from 'rxjs';
import { AuthSessionService } from '../../../../core/application/auth/auth-session.service';
import { BuyerOrdersService, type BuyerOrder } from '../../services/buyer-orders.service';
import { BuyerPedidosApiService } from '../../services/buyer-pedidos-api.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import Swal from 'sweetalert2';

interface ChatTarget {
  id_colaborador: string;
  nombre: string;
}

const POLL_MS = 8000;

function mergePedidosVista(api: BuyerOrder[], local: BuyerOrder[]): BuyerOrder[] {
  const map = new Map<string, BuyerOrder>();
  for (const o of api) {
    map.set(o.id_pedido, o);
  }
  for (const l of local) {
    if (!map.has(l.id_pedido)) {
      map.set(l.id_pedido, l);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime(),
  );
}

@Component({
  selector: 'app-buyer-orders-page',
  standalone: false,
  templateUrl: './buyer-orders-page.component.html',
  styleUrl: './buyer-orders-page.component.css',
})
export class BuyerOrdersPageComponent {
  protected readonly orders = inject(BuyerOrdersService);
  private readonly pedidosApi = inject(BuyerPedidosApiService);
  private readonly authSession = inject(AuthSessionService);
  private readonly notificacion = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly apiOrders = signal<BuyerOrder[]>([]);

  protected readonly pedidos_vista = computed(() =>
    mergePedidosVista(this.apiOrders(), this.orders.items()),
  );

  protected readonly total_pedidos_vista = computed(() => this.pedidos_vista().length);

  protected readonly detalle_abierto = signal<BuyerOrder | null>(null);
  protected readonly chat_target = signal<ChatTarget | null>(null);
  protected readonly chat_abierto = computed(() => this.chat_target() !== null);

  protected readonly fecha_minima = new Date().toISOString().slice(0, 10);

  protected readonly horarios: { value: string; label: string }[] = [
    { value: '09-12', label: 'Mañana (9:00 – 12:00)' },
    { value: '12-15', label: 'Mediodía (12:00 – 15:00)' },
    { value: '15-18', label: 'Tarde (15:00 – 18:00)' },
    { value: '18-20', label: 'Noche (18:00 – 20:00)' },
  ];

  constructor() {
    interval(POLL_MS)
      .pipe(
        startWith(0),
        switchMap(() => {
          if (!this.authSession.hasRole('buyer')) {
            return of([] as BuyerOrder[]);
          }
          return this.pedidosApi.fetchHistorial().pipe(catchError(() => of([])));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((list) => this.apiOrders.set(list));

    effect(() => {
      const det = this.detalle_abierto();
      if (!det) {
        return;
      }
      const fresh = this.pedidos_vista().find((p) => p.id_pedido === det.id_pedido);
      if (!fresh) {
        return;
      }
      if (
        fresh.estado !== det.estado ||
        fresh.total !== det.total ||
        fresh.lineas.length !== det.lineas.length
      ) {
        this.detalle_abierto.set(fresh);
      }
    });
  }

  protected es_desde_api(pedido: BuyerOrder): boolean {
    return pedido.id_pedido.startsWith('API-');
  }

  protected abrir_detalle(pedido: BuyerOrder): void {
    this.detalle_abierto.set(pedido);
  }

  protected cerrar_detalle(): void {
    this.detalle_abierto.set(null);
  }

  protected puede_modificar(pedido: BuyerOrder): boolean {
    return pedido.estado === 'pendiente' || pedido.estado === 'en_camino';
  }

  protected puede_reagendar(pedido: BuyerOrder): boolean {
    return this.puede_modificar(pedido) && !this.es_desde_api(pedido);
  }

  protected async cancelar_pedido(pedido: BuyerOrder): Promise<void> {
    const confirmado = await this.notificacion.confirmar(
      'Cancelar pedido',
      `¿Estás seguro de cancelar el pedido #${pedido.id_pedido}? Esta acción no se puede deshacer.`,
      'Sí, cancelar',
    );
    if (!confirmado) {
      return;
    }

    const apiMatch = /^API-(\d+)$/.exec(pedido.id_pedido);
    if (apiMatch) {
      try {
        await firstValueFrom(this.pedidosApi.cancelarPedido(Number(apiMatch[1])));
        this.orders.eliminarSiExiste(pedido.id_pedido);
        this.detalle_abierto.set(null);
        this.apiOrders.update((prev) =>
          prev.map((p) =>
            p.id_pedido === pedido.id_pedido ? { ...p, estado: 'cancelado' as const } : p,
          ),
        );
        await this.notificacion.exito('Pedido cancelado', `El pedido #${pedido.id_pedido} fue cancelado.`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'No se pudo cancelar.';
        await this.notificacion.error('Error', msg);
      }
      return;
    }

    const ok = this.orders.cancelar(pedido.id_pedido);
    if (ok) {
      this.detalle_abierto.set(null);
      await this.notificacion.exito('Pedido cancelado', `El pedido #${pedido.id_pedido} fue cancelado.`);
    } else {
      await this.notificacion.error('Error', 'No se pudo cancelar el pedido.');
    }
  }

  protected async reagendar_pedido(pedido: BuyerOrder): Promise<void> {
    const { value: formValues } = await Swal.fire<{ fecha: string; horario: string }>({
      title: 'Reagendar entrega',
      html: `
        <div style="text-align:left;font-size:14px;">
          <label style="display:block;margin-bottom:4px;font-weight:600;color:#1c1917;">Nueva fecha</label>
          <input id="swal-fecha" type="date" min="${this.fecha_minima}" value="${pedido.fecha_entrega}"
            style="width:100%;padding:8px 12px;border:1px solid #d6d3d1;border-radius:12px;margin-bottom:16px;font-size:14px;" />
          <label style="display:block;margin-bottom:4px;font-weight:600;color:#1c1917;">Horario</label>
          <select id="swal-horario"
            style="width:100%;padding:8px 12px;border:1px solid #d6d3d1;border-radius:12px;font-size:14px;">
            ${this.horarios.map((h) => `<option value="${h.value}" ${h.value === pedido.horario_entrega ? 'selected' : ''}>${h.label}</option>`).join('')}
          </select>
        </div>
      `,
      confirmButtonText: 'Reagendar',
      confirmButtonColor: '#f472b6',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      focusConfirm: false,
      preConfirm: () => {
        const fecha = (document.getElementById('swal-fecha') as HTMLInputElement).value;
        const horario = (document.getElementById('swal-horario') as HTMLSelectElement).value;
        if (!fecha || !horario) {
          Swal.showValidationMessage('Selecciona fecha y horario');
          return;
        }
        return { fecha, horario };
      },
    });

    if (!formValues) return;

    const ok = this.orders.reagendar(pedido.id_pedido, formValues.fecha, formValues.horario);
    if (ok) {
      this.detalle_abierto.set(null);
      await this.notificacion.exito(
        'Pedido reagendado',
        `Entrega actualizada al ${formValues.fecha} (${this.orders.etiqueta_horario(formValues.horario)}).`,
      );
    } else {
      await this.notificacion.error('Error', 'No se pudo reagendar el pedido.');
    }
  }

  protected abrir_chat(pedido: BuyerOrder): void {
    this.detalle_abierto.set(null);
    this.chat_target.set({
      id_colaborador: pedido.email_colaborador || pedido.id_colaborador,
      nombre: pedido.nombre_colaborador,
    });
  }

  protected cerrar_chat(): void {
    this.chat_target.set(null);
  }

  protected formato_fecha(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  protected formato_fecha_corta(fecha: string): string {
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }
}
