import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { catchError, of, switchMap, tap } from 'rxjs';
import { GetAllAdminProductsUseCase } from '../../../../core/application/admin-products/get-all-admin-products.use-case';
import { AdminProductRepositoryPort } from '../../../../core/domain/admin-product/admin-product.repository.port';
import {
  filterAdminProducts,
  type AdminProductCategoryFilter,
} from '../../../../core/domain/admin-product/admin-product-filter';
import type { AdminProduct } from '../../../../core/domain/admin-product/admin-product.model';
import { collaboratorCategoryLabel } from '../../../buyer/utils/collaborator-category-ui';
import { NotificationService } from '../../../../shared/services/notification.service';
import { BuyerCatalogRefreshService } from '../../../../core/application/buyer/buyer-catalog-refresh.service';
import type { CollaboratorCategory } from '../../../../core/domain/collaborator/collaborator.model';

type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-collaborator-products-page',
  standalone: false,
  templateUrl: './collaborator-products-page.component.html',
  styleUrl: './collaborator-products-page.component.css',
})
export class CollaboratorProductsPageComponent {
  @ViewChild('productTrack', { read: ElementRef })
  private readonly productTrack?: ElementRef<HTMLElement>;

  private readonly getAllAdminProducts = inject(GetAllAdminProductsUseCase);
  private readonly adminProductRepo = inject(AdminProductRepositoryPort);
  private readonly notificacion = inject(NotificationService);
  private readonly buyerCatalogRefresh = inject(BuyerCatalogRefreshService);

  private readonly listVersion = signal(0);
  protected readonly listLoadError = signal<string | null>(null);
  protected readonly allProducts = toSignal(
    toObservable(this.listVersion).pipe(
      switchMap(() =>
        this.getAllAdminProducts.execute().pipe(
          tap(() => this.listLoadError.set(null)),
          catchError((e) => {
            const msg = e instanceof Error ? e.message : 'No se pudo cargar tu menú.';
            this.listLoadError.set(msg);
            return of([] as AdminProduct[]);
          }),
        ),
      ),
    ),
    { initialValue: [] as AdminProduct[] },
  );

  protected readonly modalAbierto = signal(false);
  protected readonly formMode = signal<FormMode>('create');
  protected readonly editingId = signal<string | null>(null);
  protected readonly formNombre = signal('');
  protected readonly formPrecio = signal('');
  protected readonly formStock = signal('');
  protected readonly formCategoria = signal<CollaboratorCategory>('donas');
  protected readonly formEnviando = signal(false);

  protected readonly tituloModal = computed(() =>
    this.formMode() === 'create' ? 'Nuevo platillo' : 'Editar platillo',
  );

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
    return {
      total: list.length,
      active,
      outOfStock,
    };
  });

  protected readonly categoryLabel = collaboratorCategoryLabel;

  protected readonly categoryOptions: { id: CollaboratorCategory; label: string }[] = [
    { id: 'donas', label: 'Donas' },
    { id: 'galletas', label: 'Galletas' },
    { id: 'bebidas', label: 'Bebidas' },
  ];

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

  protected onFormNombre(event: Event): void {
    this.formNombre.set((event.target as HTMLInputElement).value);
  }

  protected onFormPrecio(event: Event): void {
    this.formPrecio.set((event.target as HTMLInputElement).value);
  }

  protected onFormStock(event: Event): void {
    this.formStock.set((event.target as HTMLInputElement).value);
  }

  protected onFormCategoriaChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    if (v === 'donas' || v === 'galletas' || v === 'bebidas') {
      this.formCategoria.set(v);
    }
  }

  protected abrirCrear(): void {
    this.formMode.set('create');
    this.editingId.set(null);
    this.formNombre.set('');
    this.formPrecio.set('');
    this.formStock.set('0');
    this.formCategoria.set('donas');
    this.modalAbierto.set(true);
  }

  protected cerrarModal(): void {
    if (this.formEnviando()) {
      return;
    }
    this.modalAbierto.set(false);
  }

  protected onEdit(product: AdminProduct): void {
    this.formMode.set('edit');
    this.editingId.set(product.id);
    this.formNombre.set(product.name);
    this.formPrecio.set(String(product.priceMx));
    this.formStock.set(String(product.stock));
    this.formCategoria.set(product.category);
    this.modalAbierto.set(true);
  }

  protected async guardarFormulario(): Promise<void> {
    const nombre = this.formNombre().trim();
    if (!nombre) {
      await this.notificacion.error('Datos incompletos', 'Indica el nombre del platillo.');
      return;
    }
    const precio = Number(this.formPrecio().replace(',', '.'));
    if (!Number.isFinite(precio) || precio <= 0) {
      await this.notificacion.error('Datos incompletos', 'El precio debe ser un número mayor que 0.');
      return;
    }
    const stock = Number(this.formStock());
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      await this.notificacion.error('Datos incompletos', 'El stock debe ser un entero mayor o igual a 0.');
      return;
    }

    const categoria = this.formCategoria();
    this.formEnviando.set(true);
    try {
      if (this.formMode() === 'create') {
        await firstValueFrom(
          this.adminProductRepo.create({
            nombre,
            precio,
            categoria,
            stock_disponible: stock,
            id_colaborador: null,
          }),
        );
        await this.notificacion.exito('Platillo creado', `"${nombre}" se añadió a tu menú.`);
      } else {
        const id = this.editingId();
        if (!id) {
          return;
        }
        await firstValueFrom(
          this.adminProductRepo.update(id, {
            nombre,
            precio,
            categoria,
            stock_disponible: stock,
          }),
        );
        await this.notificacion.exito('Platillo actualizado', `Los cambios en "${nombre}" se guardaron.`);
      }
      this.modalAbierto.set(false);
      this.categoryFilter.set('all');
      this.searchQuery.set('');
      this.listVersion.update((v) => v + 1);
      this.buyerCatalogRefresh.markStale();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Intenta de nuevo.';
      await this.notificacion.error('No se pudo guardar', msg);
    } finally {
      this.formEnviando.set(false);
    }
  }

  protected async onDelete(product: AdminProduct): Promise<void> {
    const confirmado = await this.notificacion.confirmar(
      'Eliminar platillo',
      `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
    );
    if (!confirmado) {
      return;
    }
    try {
      await firstValueFrom(this.adminProductRepo.delete(product.id));
      await this.notificacion.exito('Eliminado', `"${product.name}" fue eliminado.`);
      this.listVersion.update((v) => v + 1);
      this.buyerCatalogRefresh.markStale();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Intenta de nuevo.';
      await this.notificacion.error('No se pudo eliminar', msg);
    }
  }

  protected onNewProduct(): void {
    this.abrirCrear();
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
