import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

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

@Component({
  selector: 'app-buyer-checkout-pago-page',
  standalone: false,
  templateUrl: './buyer-checkout-pago-page.component.html',
  styleUrl: './buyer-checkout-pago-page.component.css',
})
export class BuyerCheckoutPagoPageComponent {
  private readonly router = inject(Router);

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

  private copiar_al_portapapeles(texto: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(texto);
    }
  }
}
