import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthSessionService } from '../../../../core/application/auth/auth-session.service';
import { GetAllAdminProductsUseCase } from '../../../../core/application/admin-products/get-all-admin-products.use-case';
import {
  filterAdminProducts,
  type AdminProductCategoryFilter,
} from '../../../../core/domain/admin-product/admin-product-filter';
import type { AdminProduct } from '../../../../core/domain/admin-product/admin-product.model';
import { collaboratorCategoryLabel } from '../../../buyer/utils/collaborator-category-ui';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-admin-products-page',
  standalone: false,
  templateUrl: './admin-products-page.component.html',
  styleUrl: './admin-products-page.component.css',
})
export class AdminProductsPageComponent {
  @ViewChild('productTrack', { read: ElementRef })
  private readonly productTrack?: ElementRef<HTMLElement>;

  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly getAllAdminProducts = inject(GetAllAdminProductsUseCase);
  private readonly notificacion = inject(NotificationService);

  private readonly allProducts = toSignal(this.getAllAdminProducts.execute(), {
    initialValue: [] as AdminProduct[],
  });

  protected readonly categoryFilter = signal<AdminProductCategoryFilter>('all');
  protected readonly searchQuery = signal('');

  protected readonly filterOptions: { id: AdminProductCategoryFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'donas', label: 'Donas' },
    { id: 'galletas', label: 'Galletas' },
    { id: 'bebidas', label: 'Bebidas' },
  ];

  protected readonly filteredProducts = computed(() =>
    filterAdminProducts(this.allProducts(), this.categoryFilter(), this.searchQuery()),
  );

  protected readonly kpis = computed(() => {
    const list = this.allProducts();
    const active = list.filter((p) => p.status === 'active').length;
    const outOfStock = list.filter((p) => p.status === 'out_of_stock').length;
    const collaborators = new Set(list.map((p) => p.collaboratorName)).size;
    return {
      total: list.length,
      active,
      outOfStock,
      collaborators,
    };
  });

  protected readonly categoryLabel = collaboratorCategoryLabel;

  protected setCategory(id: AdminProductCategoryFilter): void {
    this.categoryFilter.set(id);
  }

  protected isCategoryActive(id: AdminProductCategoryFilter): boolean {
    return this.categoryFilter() === id;
  }

  protected onSearchInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.searchQuery.set(v);
  }

  protected async onEdit(product: AdminProduct): Promise<void> {
    await this.notificacion.info(
      'Editar producto',
      `La edición de "${product.name}" estará disponible próximamente.`,
    );
  }

  protected async onDelete(product: AdminProduct): Promise<void> {
    const confirmado = await this.notificacion.confirmar(
      'Eliminar producto',
      `¿Estás seguro de eliminar "${product.name}" del catálogo? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
    );
    if (confirmado) {
      await this.notificacion.exito('Producto eliminado', `"${product.name}" fue eliminado del catálogo.`);
    }
  }

  protected async onNewProduct(): Promise<void> {
    await this.notificacion.info(
      'Nuevo producto',
      'El formulario de alta de productos estará disponible próximamente.',
    );
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

  protected scrollProducts(direction: -1 | 1): void {
    const el = this.productTrack?.nativeElement;
    if (!el) {
      return;
    }
    const step = Math.max(280, Math.floor(el.clientWidth * 0.75)) * direction;
    el.scrollBy({ left: step, behavior: 'smooth' });
  }
}
