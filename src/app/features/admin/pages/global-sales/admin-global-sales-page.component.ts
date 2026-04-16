import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthSessionService } from '../../../../core/application/auth/auth-session.service';
import { GetAllAdminOrdersUseCase } from '../../../../core/application/admin-orders/get-all-admin-orders.use-case';
import {
  filterAdminOrders,
  type AdminOrderStatusFilter,
} from '../../../../core/domain/admin-order/admin-order-filter';
import type { AdminOrder, AdminOrderStatus } from '../../../../core/domain/admin-order/admin-order.model';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-admin-global-sales-page',
  standalone: false,
  templateUrl: './admin-global-sales-page.component.html',
  styleUrl: './admin-global-sales-page.component.css',
})
export class AdminGlobalSalesPageComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly getAllAdminOrders = inject(GetAllAdminOrdersUseCase);
  private readonly notificacion = inject(NotificationService);

  private readonly allOrders = toSignal(this.getAllAdminOrders.execute(), {
    initialValue: [] as AdminOrder[],
  });

  protected readonly statusFilter = signal<AdminOrderStatusFilter>('all');
  protected readonly searchQuery = signal('');
  protected readonly detailOrder = signal<AdminOrder | null>(null);

  protected readonly filterOptions: { id: AdminOrderStatusFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'on_the_way', label: 'En camino' },
    { id: 'delivered', label: 'Entregados' },
    { id: 'cancelled', label: 'Cancelados' },
  ];

  protected readonly statusOptions: { id: AdminOrderStatus; label: string }[] = [
    { id: 'pending', label: 'Pendiente' },
    { id: 'on_the_way', label: 'En camino' },
    { id: 'delivered', label: 'Entregado' },
    { id: 'cancelled', label: 'Cancelado' },
  ];

  protected readonly filteredOrders = computed(() => {
    const list = filterAdminOrders(
      this.allOrders(),
      this.statusFilter(),
      this.searchQuery(),
    );
    return [...list].sort(
      (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime(),
    );
  });

  protected readonly kpis = computed(() => {
    const list = this.allOrders();
    const pending = list.filter((o) => o.status === 'pending').length;
    const delivered = list.filter((o) => o.status === 'delivered').length;
    const cancelled = list.filter((o) => o.status === 'cancelled').length;
    const revenue = list
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalMx, 0);
    return {
      total: list.length,
      pending,
      delivered,
      cancelled,
      revenue,
    };
  });

  protected setStatus(id: AdminOrderStatusFilter): void {
    this.statusFilter.set(id);
  }

  protected isStatusActive(id: AdminOrderStatusFilter): boolean {
    return this.statusFilter() === id;
  }

  protected onSearchInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.searchQuery.set(v);
  }

  protected openDetail(order: AdminOrder): void {
    this.detailOrder.set(order);
  }

  protected closeDetail(): void {
    this.detailOrder.set(null);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.detailOrder()) {
      this.closeDetail();
    }
  }

  protected async cambiarEstado(order: AdminOrder, nuevoEstado: AdminOrderStatus): Promise<void> {
    if (order.status === nuevoEstado) {
      return;
    }
    const label = this.statusLabel(nuevoEstado);
    const confirmado = await this.notificacion.confirmar(
      'Cambiar estado',
      `¿Cambiar el pedido #${order.id} a "${label}"?`,
      `Sí, cambiar a ${label}`,
    );
    if (!confirmado) {
      return;
    }
    const updated: AdminOrder = { ...order, status: nuevoEstado };
    this.detailOrder.set(updated);
    await this.notificacion.exito('Estado actualizado', `Pedido #${order.id} ahora es "${label}".`);
  }

  protected nextStatusOptions(current: AdminOrderStatus): { id: AdminOrderStatus; label: string }[] {
    return this.statusOptions.filter((o) => o.id !== current);
  }

  protected formatOrderDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    const time = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Hoy ${time}`;
    }
    return (
      d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) +
      ' ' +
      time
    );
  }

  protected itemsSummary(order: AdminOrder): string {
    return order.items.map((i) => `${i.productName} x${i.quantity}`).join(', ');
  }

  protected itemsSummaryLong(order: AdminOrder): string {
    return order.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ');
  }

  protected statusLabel(status: AdminOrderStatus): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'on_the_way':
        return 'En camino';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
    }
  }

  protected async logout(): Promise<void> {
    const confirmado = await this.notificacion.confirmar(
      'Cerrar sesión',
      '¿Seguro que deseas salir del panel de administración?',
      'Sí, salir',
    );
    if (confirmado) {
      this.authSession.logout();
      void this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  protected async exportCsv(): Promise<void> {
    try {
      const rows = this.filteredOrders();
      const header = [
        'Pedido',
        'Cliente',
        'Teléfono',
        'Colaborador',
        'Productos',
        'Total MXN',
        'Fecha',
        'Estado',
      ];
      const lines = [
        header.join(','),
        ...rows.map((o) =>
          [
            o.id,
            csvEscape(o.customerName),
            csvEscape(o.customerPhone),
            csvEscape(o.collaboratorName),
            csvEscape(this.itemsSummary(o)),
            String(o.totalMx),
            o.createdAtIso,
            this.statusLabel(o.status),
          ].join(','),
        ),
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedidos-donideli-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      await this.notificacion.exito('CSV exportado', `${rows.length} pedido(s) exportados correctamente.`);
    } catch {
      await this.notificacion.error('Error al exportar', 'No se pudo generar el archivo CSV.');
    }
  }
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
