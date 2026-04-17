import {
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthSessionService } from '../../../../core/application/auth/auth-session.service';
import { GetAllAdminProductsUseCase } from '../../../../core/application/admin-products/get-all-admin-products.use-case';
import { AdminProductRepositoryPort } from '../../../../core/domain/admin-product/admin-product.repository.port';
import { CollaboratorRepositoryPort } from '../../../../core/domain/collaborator/collaborator.repository.port';
import type { Collaborator, CollaboratorCategory } from '../../../../core/domain/collaborator/collaborator.model';
import {
  filterAdminProducts,
  type AdminProductCategoryFilter,
} from '../../../../core/domain/admin-product/admin-product-filter';
import type { AdminProduct } from '../../../../core/domain/admin-product/admin-product.model';
import { collaboratorCategoryLabel } from '../../../buyer/utils/collaborator-category-ui';
import { NotificationService } from '../../../../shared/services/notification.service';
import { BuyerCatalogRefreshService } from '../../../../core/application/buyer/buyer-catalog-refresh.service';
import { AdminChatService } from '../../services/admin-chat.service';

type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-products-page',
  standalone: false,
  templateUrl: './admin-products-page.component.html',
  styleUrl: './admin-products-page.component.css',
})
export class AdminProductsPageComponent implements OnInit, OnDestroy {
  @ViewChild('productTrack', { read: ElementRef })
  private readonly productTrack?: ElementRef<HTMLElement>;

  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly getAllAdminProducts = inject(GetAllAdminProductsUseCase);
  private readonly adminProductRepo = inject(AdminProductRepositoryPort);
  private readonly collaboratorRepo = inject(CollaboratorRepositoryPort);
  private readonly notificacion = inject(NotificationService);
  private readonly buyerCatalogRefresh = inject(BuyerCatalogRefreshService);
  protected readonly adminChat = inject(AdminChatService);
  protected readonly chat_panel_abierto = signal(false);

  private readonly listVersion = signal(0);
  private readonly allProducts = toSignal(
    toObservable(this.listVersion).pipe(switchMap(() => this.getAllAdminProducts.execute())),
    { initialValue: [] as AdminProduct[] },
  );

  protected readonly collaborators = toSignal(this.collaboratorRepo.findAllActive(), {
    initialValue: [] as Collaborator[],
  });

  protected readonly modalAbierto = signal(false);
  protected readonly formMode = signal<FormMode>('create');
  protected readonly editingId = signal<string | null>(null);
  protected readonly formNombre = signal('');
  protected readonly formPrecio = signal('');
  protected readonly formStock = signal('');
  protected readonly formCategoria = signal<CollaboratorCategory>('donas');
  protected readonly formColaboradorId = signal('');
  protected readonly formEnviando = signal(false);

  protected readonly tituloModal = computed(() =>
    this.formMode() === 'create' ? 'Nuevo producto' : 'Editar producto',
  );

  ngOnInit(): void {
    void this.adminChat.conectar().then(() => {
      this.adminChat.entrar_room('comprador@donideli.com');
    });
  }

  ngOnDestroy(): void {
    this.adminChat.desconectar();
  }

  protected toggle_chat(): void {
    this.chat_panel_abierto.update((v) => !v);
  }

  protected cerrar_chat(): void {
    this.chat_panel_abierto.set(false);
    this.adminChat.cerrar_conversacion();
  }

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

  protected onFormColaboradorChange(event: Event): void {
    this.formColaboradorId.set((event.target as HTMLSelectElement).value);
  }

  protected abrirCrear(): void {
    this.formMode.set('create');
    this.editingId.set(null);
    this.formNombre.set('');
    this.formPrecio.set('');
    this.formStock.set('0');
    this.formCategoria.set('donas');
    this.formColaboradorId.set('');
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
    this.formColaboradorId.set(
      product.collaboratorDbId != null ? String(product.collaboratorDbId) : '',
    );
    this.modalAbierto.set(true);
  }

  protected async guardarFormulario(): Promise<void> {
    const nombre = this.formNombre().trim();
    if (!nombre) {
      await this.notificacion.error('Datos incompletos', 'Indica el nombre del producto.');
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
    const colStr = this.formColaboradorId().trim();
    let idColaborador: number | null = null;
    if (colStr !== '') {
      const n = Number(colStr);
      if (!Number.isInteger(n) || n < 1) {
        await this.notificacion.error('Datos incompletos', 'Colaborador no válido.');
        return;
      }
      idColaborador = n;
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
            id_colaborador: idColaborador,
          }),
        );
        await this.notificacion.exito('Producto creado', `"${nombre}" se añadió al catálogo.`);
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
            id_colaborador: idColaborador,
          }),
        );
        await this.notificacion.exito('Producto actualizado', `Los cambios en "${nombre}" se guardaron.`);
      }
      this.modalAbierto.set(false);
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
      'Eliminar producto',
      `¿Eliminar "${product.name}" del catálogo? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
    );
    if (!confirmado) {
      return;
    }
    try {
      await firstValueFrom(this.adminProductRepo.delete(product.id));
      await this.notificacion.exito('Producto eliminado', `"${product.name}" fue eliminado.`);
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
