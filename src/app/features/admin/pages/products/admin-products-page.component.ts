import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GetAllAdminProductsUseCase } from '../../../../core/application/admin-products/get-all-admin-products.use-case';
import {
  filterAdminProducts,
  type AdminProductCategoryFilter,
} from '../../../../core/domain/admin-product/admin-product-filter';
import type { AdminProduct } from '../../../../core/domain/admin-product/admin-product.model';
import { collaboratorCategoryLabel } from '../../../buyer/utils/collaborator-category-ui';

@Component({
  selector: 'app-admin-products-page',
  standalone: false,
  templateUrl: './admin-products-page.component.html',
  styleUrl: './admin-products-page.component.css',
})
export class AdminProductsPageComponent {
  private readonly getAllAdminProducts = inject(GetAllAdminProductsUseCase);

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

  protected onEdit(product: AdminProduct): void {
    // Reservado: navegación a formulario de edición
    void product;
  }

  protected onDelete(product: AdminProduct): void {
    void product;
  }

  protected onNewProduct(): void {
    // Reservado: alta de producto
  }
}
