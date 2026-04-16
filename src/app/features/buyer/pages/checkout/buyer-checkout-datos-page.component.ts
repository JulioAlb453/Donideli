import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export type TipoEntregaCheckout = 'domicilio' | 'tienda';

export interface DatosEntregaCheckout {
  tipo_entrega: TipoEntregaCheckout;
  nombre: string;
  apellido: string;
  telefono: string;
  calle_numero: string;
  colonia: string;
  ciudad: string;
  referencias: string;
  fecha_entrega: string;
  horario_entrega: string;
  notas_adicionales: string;
}

const STORAGE_KEY = 'donideli_checkout_entrega';

@Component({
  selector: 'app-buyer-checkout-datos-page',
  standalone: false,
  templateUrl: './buyer-checkout-datos-page.component.html',
  styleUrl: './buyer-checkout-datos-page.component.css',
})
export class BuyerCheckoutDatosPageComponent {
  private readonly router = inject(Router);

  protected readonly fecha_minima = new Date().toISOString().slice(0, 10);

  protected readonly horarios_entrega: { value: string; label: string }[] = [
    { value: '', label: 'Selecciona…' },
    { value: '09-12', label: 'Mañana (9:00 – 12:00)' },
    { value: '12-15', label: 'Mediodía (12:00 – 15:00)' },
    { value: '15-18', label: 'Tarde (15:00 – 18:00)' },
    { value: '18-20', label: 'Noche (18:00 – 20:00)' },
  ];

  protected modelo: DatosEntregaCheckout = {
    tipo_entrega: 'domicilio',
    nombre: '',
    apellido: '',
    telefono: '',
    calle_numero: '',
    colonia: '',
    ciudad: '',
    referencias: '',
    fecha_entrega: '',
    horario_entrega: '',
    notas_adicionales: '',
  };

  protected readonly intento_envio = signal(false);

  protected seleccionar_tipo_entrega(tipo: TipoEntregaCheckout): void {
    this.modelo.tipo_entrega = tipo;
  }

  protected volver_al_carrito(): void {
    void this.router.navigate(['/buyer/carrito']);
  }

  protected formularioValido(): boolean {
    return this.validar();
  }

  protected confirmar_pedido(): void {
    this.intento_envio.set(true);
    if (!this.validar()) {
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.modelo));
    } catch {
    }
    void this.router.navigate(['/buyer/checkout/pago']);
  }

  private validar(): boolean {
    const m = this.modelo;
    const base =
      m.nombre.trim().length > 0 &&
      m.apellido.trim().length > 0 &&
      m.telefono.trim().length > 0 &&
      m.fecha_entrega.length > 0 &&
      m.horario_entrega.length > 0;

    if (!base) {
      return false;
    }

    if (m.tipo_entrega === 'domicilio') {
      return m.calle_numero.trim().length > 0 && m.ciudad.trim().length > 0;
    }

    return true;
  }

  protected mostrar_error_campo(
    condicion: boolean,
  ): boolean {
    return this.intento_envio() && condicion;
  }
}
