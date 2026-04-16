import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import type { Collaborator, CollaboratorCategory } from '../../../../core/domain/collaborator/collaborator.model';
import { CollaboratorRepositoryPort } from '../../../../core/domain/collaborator/collaborator.repository.port';
import { collaboratorCategoryToFlaticon } from '../../utils/collaborator-category-ui';
import { BuyerCartService } from '../../services/buyer-cart.service';
import {
  getMenuByCollaborator,
  type MenuProduct,
} from '../../../../core/infrastructure/collaborators/collaborator-menu-products.data';

@Component({
  selector: 'app-buyer-collaborator-menu-page',
  standalone: false,
  templateUrl: './buyer-collaborator-menu-page.component.html',
  styleUrl: './buyer-collaborator-menu-page.component.css',
})
export class BuyerCollaboratorMenuPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly collaboratorRepo = inject(CollaboratorRepositoryPort);
  private readonly cart = inject(BuyerCartService);

  private readonly collaborators = toSignal(this.collaboratorRepo.findAllActive(), {
    initialValue: [] as Collaborator[],
  });

  protected readonly id_colaborador = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id'))),
    { initialValue: null },
  );

  protected readonly selectedCategory = toSignal(
    this.route.queryParamMap.pipe(map((q) => this.parseCategory(q.get('category')))),
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
      donas: 'Disfruta de la vida con una rica dona',
      bebidas: 'Refresca tu dia con bebidas preparadas al momento',
      galletas: 'Galletas artesanales recien horneadas para acompanarte',
    };
    return m[this.selectedCategory()];
  });

  protected readonly heroIcon = computed(() =>
    collaboratorCategoryToFlaticon(this.selectedCategory()),
  );

  private readonly colaborador_actual = computed(() => {
    const id = this.id_colaborador();
    if (!id) return null;
    return this.collaborators().find((c) => c.id === id) ?? null;
  });

  protected readonly nombre_colaborador = computed(() =>
    this.colaborador_actual()?.displayName ?? 'Colaborador',
  );

  protected readonly email_colaborador = computed(() =>
    this.colaborador_actual()?.email ?? '',
  );

  protected readonly productCardTopClass = computed(() => {
    switch (this.selectedCategory()) {
      case 'bebidas': return 'bg-accent-200';
      case 'galletas': return 'bg-primary-600';
      default: return 'bg-secondary-50';
    }
  });

  protected readonly productCardTagClass = computed(() => {
    switch (this.selectedCategory()) {
      case 'bebidas': return 'border-accent-500/60 bg-white/90 text-primary-800';
      case 'galletas': return 'border-primary-300/80 bg-primary-800/40 text-primary-50';
      default: return 'border-secondary-300 text-secondary-600';
    }
  });

  protected readonly productCardButtonClass = computed(() => {
    switch (this.selectedCategory()) {
      case 'bebidas': return 'bg-accent-500 text-primary-900 hover:bg-accent-600';
      case 'galletas': return 'bg-primary-800 text-white hover:bg-primary-900';
      default: return 'bg-secondary-400 text-white hover:bg-secondary-500';
    }
  });

  protected readonly allCollaboratorProducts = computed(() => {
    const id = this.id_colaborador();
    if (!id) return [];
    return getMenuByCollaborator(id);
  });

  protected readonly products = computed(() =>
    this.allCollaboratorProducts().filter((p) => p.categoria === this.selectedCategory()),
  );

  protected readonly availableCategories = computed(() => {
    const cats = new Set(this.allCollaboratorProducts().map((p) => p.categoria));
    return this.allCategoryLinks.filter((c) => cats.has(c.id));
  });

  private readonly allCategoryLinks: { id: CollaboratorCategory; label: string }[] = [
    { id: 'donas', label: 'Donas' },
    { id: 'galletas', label: 'Galletas' },
    { id: 'bebidas', label: 'Bebidas' },
  ];

  protected readonly categoryLinks = this.allCategoryLinks;

  protected isActiveCategory(category: CollaboratorCategory): boolean {
    return this.selectedCategory() === category;
  }

  protected agregar_al_carrito(producto: MenuProduct): void {
    const cid = this.id_colaborador() ?? '0';
    this.cart.addProduct({
      id_colaborador: cid,
      email_colaborador: this.email_colaborador(),
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      precio: producto.precio,
      nombre_colaborador: this.nombre_colaborador(),
      icon: collaboratorCategoryToFlaticon(this.selectedCategory()),
    });
  }

  private parseCategory(raw: string | null): CollaboratorCategory {
    if (raw === 'donas' || raw === 'bebidas' || raw === 'galletas') {
      return raw;
    }
    return 'donas';
  }
}
