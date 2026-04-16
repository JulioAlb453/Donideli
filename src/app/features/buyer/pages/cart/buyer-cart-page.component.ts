import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BuyerCartService } from '../../services/buyer-cart.service';

@Component({
  selector: 'app-buyer-cart-page',
  standalone: false,
  templateUrl: './buyer-cart-page.component.html',
  styleUrl: './buyer-cart-page.component.css',
})
export class BuyerCartPageComponent {
  private readonly router = inject(Router);
  protected readonly cart = inject(BuyerCartService);

  protected readonly costo_envio = signal(20);

  protected readonly lineas_con_importe = computed(() =>
    this.cart.items().map((line) => ({
      ...line,
      importe_linea: line.precio * line.cantidad,
    })),
  );

  protected readonly precio_total = computed(
    () => this.cart.subtotal() + this.costo_envio(),
  );

  protected continuar_datos(): void {
    void this.router.navigate(['/buyer/checkout/datos']);
  }

  protected ir_colaboradores(): void {
    void this.router.navigate(['/buyer/colaboradores']);
  }
}
