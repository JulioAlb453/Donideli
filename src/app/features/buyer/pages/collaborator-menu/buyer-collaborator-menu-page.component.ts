import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import type { Collaborator, CollaboratorCategory } from '../../../../core/domain/collaborator/collaborator.model';
import { CollaboratorRepositoryPort } from '../../../../core/domain/collaborator/collaborator.repository.port';
import { collaboratorCategoryToFlaticon } from '../../utils/collaborator-category-ui';
import { BuyerCartService } from '../../services/buyer-cart.service';

interface MenuProduct {
  id_producto: string;
  nombre: string;
  descripcion: string;
  precio: number;
  etiquetas: string[];
}

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
    const map: Record<CollaboratorCategory, string> = {
      donas: 'Donas',
      bebidas: 'Bebidas',
      galletas: 'Galletas',
    };
    return map[this.selectedCategory()];
  });

  protected readonly heroDescription = computed(() => {
    const map: Record<CollaboratorCategory, string> = {
      donas: 'Disfruta de la vida con una rica dona',
      bebidas: 'Refresca tu dia con bebidas preparadas al momento',
      galletas: 'Galletas artesanales recien horneadas para acompanarte',
    };
    return map[this.selectedCategory()];
  });

  protected readonly heroIcon = computed(() =>
    collaboratorCategoryToFlaticon(this.selectedCategory()),
  );

  protected readonly nombre_colaborador = computed(() => {
    const id = this.id_colaborador();
    const list = this.collaborators();
    if (!id) {
      return 'Colaborador';
    }
    return list.find((c) => c.id === id)?.displayName ?? 'Colaborador';
  });

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

  protected readonly products = computed(() =>
    this.productsByCategory[this.selectedCategory()],
  );

  protected readonly categoryLinks: { id: CollaboratorCategory; label: string }[] = [
    { id: 'donas', label: 'Donas' },
    { id: 'galletas', label: 'Galletas' },
    { id: 'bebidas', label: 'Bebidas' },
  ];

  private readonly productsByCategory: Record<CollaboratorCategory, MenuProduct[]> = {
    donas: [
      {
        id_producto: 'd-1',
        nombre: 'Leche Santa Clara',
        descripcion: 'Dona de vainilla con centro cremoso de chocolate y chispas de colores.',
        precio: 15,
        etiquetas: ['vainilla', 'chocolate'],
      },
      {
        id_producto: 'd-2',
        nombre: 'Glaseada Rosa',
        descripcion: 'Masa suave glaseada con cobertura frutal y topping crocante.',
        precio: 17,
        etiquetas: ['frutal', 'glaseada'],
      },
    ],
    bebidas: [
      {
        id_producto: 'b-1',
        nombre: 'Frappe de Vainilla',
        descripcion: 'Bebida fria con crema batida y toque de canela.',
        precio: 55,
        etiquetas: ['frio', 'cremoso'],
      },
      {
        id_producto: 'b-2',
        nombre: 'Iced Latte',
        descripcion: 'Espresso con leche fria, hielo y jarabe ligero.',
        precio: 48,
        etiquetas: ['cafe', 'hielo'],
      },
    ],
    galletas: [
      {
        id_producto: 'g-1',
        nombre: 'Cookie Choco Chips',
        descripcion: 'Galleta grande con chips de chocolate semiamargo.',
        precio: 22,
        etiquetas: ['choco', 'artesanal'],
      },
      {
        id_producto: 'g-2',
        nombre: 'Avena y Miel',
        descripcion: 'Textura suave con avena integral y un toque de miel.',
        precio: 20,
        etiquetas: ['avena', 'miel'],
      },
    ],
  };

  protected isActiveCategory(category: CollaboratorCategory): boolean {
    return this.selectedCategory() === category;
  }

  protected agregar_al_carrito(producto: MenuProduct): void {
    const cid = this.id_colaborador() ?? '0';
    this.cart.addProduct({
      id_colaborador: cid,
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
