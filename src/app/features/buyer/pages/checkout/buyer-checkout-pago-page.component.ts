import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../../../core/application/auth/auth-session.service';
import { BuyerCartService } from '../../services/buyer-cart.service';
import { BuyerCheckoutSubmitService } from '../../services/buyer-checkout-submit.service';
import { BuyerOrdersService, type BuyerOrderLine } from '../../services/buyer-orders.service';
import { NotificationService } from '../../../../shared/services/notification.service';

export interface DatosBancariosVendedor {
  nombre_vendedor: string;
  rol: string;
  categoria: string;
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  clabe: string;
  titular: string;
  telefono: string;
}

interface DatosEntregaCheckout {
  fecha_entrega: string;
  horario_entrega: string;
}

@Component({
  selector: 'app-buyer-checkout-pago-page',
  standalone: false,
  templateUrl: './buyer-checkout-pago-page.component.html',
  styleUrl: './buyer-checkout-pago-page.component.css',
})
export class BuyerCheckoutPagoPageComponent {
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly cart = inject(BuyerCartService);
  private readonly checkoutSubmit = inject(BuyerCheckoutSubmitService);
  private readonly ordersService = inject(BuyerOrdersService);
  private readonly notificacion = inject(NotificationService);

  protected readonly vendedor: DatosBancariosVendedor = {
    nombre_vendedor: 'Mariana López',
    rol: 'Vendedora',
    categoria: 'Menú de Donas',
    banco: 'BBVA Bancomer',
    tipo_cuenta: 'Débito',
    numero_cuenta: '1234 5678 9012 3456',
    clabe: '012 345 678901 234567',
    titular: 'Mariana López García',
    telefono: '+52 449 123 4567',
  };

  protected readonly cuenta_copiada = signal(false);
  protected readonly clabe_copiada = signal(false);
  protected readonly confirmando = signal(false);

  protected copiar_cuenta(): void {
    this.copiar_al_portapapeles(this.vendedor.numero_cuenta.replace(/\s/g, ''));
    this.cuenta_copiada.set(true);
    setTimeout(() => this.cuenta_copiada.set(false), 2000);
  }

  protected copiar_clabe(): void {
    this.copiar_al_portapapeles(this.vendedor.clabe.replace(/\s/g, ''));
    this.clabe_copiada.set(true);
    setTimeout(() => this.clabe_copiada.set(false), 2000);
  }

  protected volver_a_datos(): void {
    void this.router.navigate(['/buyer/checkout/datos']);
  }

  protected async confirmar_pedido(): Promise<void> {
    if (this.confirmando()) return;

    const items = this.cart.items();
    if (items.length === 0) {
      await this.notificacion.error('Carrito vacío', 'No hay productos en el carrito.');
      return;
    }

    const confirmado = await this.notificacion.confirmar(
      'Confirmar pedido',
      '¿Ya realizaste la transferencia y deseas confirmar tu pedido?',
      'Sí, confirmar',
    );
    if (!confirmado) return;

    if (!this.authSession.hasRole('buyer')) {
      await this.notificacion.error(
        'Inicia sesión',
        'Debes entrar como comprador para registrar el pedido en el sistema.',
      );
      return;
    }

    this.confirmando.set(true);

    const datosEntrega = this.leerDatosEntrega();

    const lineasResumen: BuyerOrderLine[] = items.map((item) => ({
      nombre_producto: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
    }));

    try {
      const { id_pedido } = await this.checkoutSubmit.enviarPedidoDesdeCarrito(items, 'transferencia');
      this.ordersService.crear_pedido({
        id_colaborador: '',
        email_colaborador: this.authSession.currentUser()?.email ?? '',
        nombre_colaborador: 'DoniDeli',
        fecha_entrega: datosEntrega.fecha_entrega,
        horario_entrega: datosEntrega.horario_entrega,
        lineas: lineasResumen,
        id_pedido_prefijado: `API-${id_pedido}`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo registrar el pedido.';
      await this.notificacion.error('Pedido no registrado', msg);
      this.confirmando.set(false);
      return;
    }

    this.cart.clear();
    this.limpiarDatosEntrega();
    this.confirmando.set(false);

    await this.notificacion.exito(
      'Pedido confirmado',
      'Tu pedido quedó registrado. El administrador lo verá en el historial.',
    );

    void this.router.navigate(['/buyer/pedidos']);
  }

  private leerDatosEntrega(): DatosEntregaCheckout {
    try {
      const raw = sessionStorage.getItem('donideli_checkout_entrega');
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DatosEntregaCheckout>;
        return {
          fecha_entrega: parsed.fecha_entrega ?? new Date().toISOString().slice(0, 10),
          horario_entrega: parsed.horario_entrega ?? '09-12',
        };
      }
    } catch { /* ignore */ }
    return {
      fecha_entrega: new Date().toISOString().slice(0, 10),
      horario_entrega: '09-12',
    };
  }

  private limpiarDatosEntrega(): void {
    try {
      sessionStorage.removeItem('donideli_checkout_entrega');
    } catch { /* ignore */ }
  }

  private copiar_al_portapapeles(texto: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(texto);
    }
  }
}
