import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { BuyerCatalogRefreshService } from '../../../../core/application/buyer/buyer-catalog-refresh.service';
import type { CollaboratorCategory } from '../../../../core/domain/collaborator/collaborator.model';
import { collaboratorCategoryToFlaticon } from '../../utils/collaborator-category-ui';
import { BuyerCartService } from '../../services/buyer-cart.service';
import { ProductCatalogApiRepository } from '../../../../core/infrastructure/productos/product-catalog-api.repository';
import type { MenuProduct } from '../../../../core/infrastructure/productos/product-catalog.mapper';

@Component({
  selector: 'app-buyer-catalog-menu-page',
  standalone: false,
  templateUrl: './buyer-catalog-menu-page.component.html',
  styleUrl: '../collaborator-menu/buyer-collaborator-menu-page.component.css',
})
export class BuyerCatalogMenuPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly cart = inject(BuyerCartService);
  private readonly catalogRepo = inject(ProductCatalogApiRepository);
  private readonly catalogRefresh = inject(BuyerCatalogRefreshService);

  protected readonly selectedCategory = toSignal(
    this.route.queryParamMap.pipe(
      map((q) => this.parseCategory(q.get('category'))),
      distinctUntilChanged(),
    ),
    { initialValue: 'donas' as CollaboratorCategory },
  );

  protected readonly categoryTitle = computed(() => {
    const m: Record<CollaboratorCategory, string> = {
      donas: 'Donas',
      bebidas: 'Bebidas',
      galletas: 'Galletas',
    };
    return m[this.selectedCategory()];
  });

  protected readonly heroDescription = computed(() => {
    const m: Record<CollaboratorCategory, string> = {
      donas: 'Selección de donas del catálogo oficial DoniDeli.',
      bebidas: 'Bebidas y cafés disponibles en tienda.',
      galletas: 'Galletas y opciones de repostería del catálogo.',
    };
    return m[this.selectedCategory()];
  });

  protected readonly heroIcon = computed(() =>
    collaboratorCategoryToFlaticon(this.selectedCategory()),
  );

  protected readonly productCardTopClass = computed(() => {
    switch (this.selectedCategory()) {
      case 'bebidas':
        return 'bg-accent-200';
      case 'galletas':
        return 'bg-primary-600';
      default:
        return 'bg-secondary-50';
    }
  });

  protected readonly productCardTagClass = computed(() => {
    switch (this.selectedCategory()) {
      case 'bebidas':
        return 'border-accent-500/60 bg-white/90 text-primary-800';
      case 'galletas':
        return 'border-primary-300/80 bg-primary-800/40 text-primary-50';
      default:
        return 'border-secondary-300 text-secondary-600';
    }
  });

  protected readonly productCardButtonClass = computed(() => {
    switch (this.selectedCategory()) {
      case 'bebidas':
        return 'bg-accent-500 text-primary-900 hover:bg-accent-600';
      case 'galletas':
        return 'bg-primary-800 text-white hover:bg-primary-900';
      default:
        return 'bg-secondary-400 text-white hover:bg-secondary-500';
    }
  });

  protected readonly allCatalogProducts = toSignal(
    toObservable(this.catalogRefresh.epoch).pipe(
      switchMap(() => this.catalogRepo.findPublicCatalog()),
    ),
    { initialValue: [] as MenuProduct[] },
  );

  protected readonly products = computed(() =>
    this.allCatalogProducts().filter(
      (p: MenuProduct) => p.categoria === this.selectedCategory(),
    ),
  );

  private readonly allCategoryLinks: { id: CollaboratorCategory; label: string }[] = [
    { id: 'donas', label: 'Donas' },
    { id: 'galletas', label: 'Galletas' },
    { id: 'bebidas', label: 'Bebidas' },
  ];

  protected readonly categoryLinks = computed(() => {
    const catalog = this.allCatalogProducts();
    if (catalog.length === 0) {
      return this.allCategoryLinks;
    }
    const cats = new Set(catalog.map((p: MenuProduct) => p.categoria));
    return this.allCategoryLinks.filter((c) => cats.has(c.id));
  });

  protected isActiveCategory(category: CollaboratorCategory): boolean {
    return this.selectedCategory() === category;
  }

  protected agregar_al_carrito(producto: MenuProduct): void {
    this.cart.addProduct({
      id_colaborador: producto.shelfId,
      email_colaborador: producto.shelfEmail,
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      precio: producto.precio,
      nombre_colaborador: producto.shelfDisplayName,
      icon: collaboratorCategoryToFlaticon(producto.categoria),
    });
  }

  private parseCategory(raw: string | null): CollaboratorCategory {
    if (raw === 'donas' || raw === 'bebidas' || raw === 'galletas') {
      return raw;
    }
    return 'donas';
  }
}
