import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import type { CollaboratorCategory } from '../../../../core/domain/collaborator/collaborator.model';
import { collaboratorCategoryToFlaticon } from '../../utils/collaborator-category-ui';

interface MenuProduct {
  id: string;
  name: string;
  description: string;
  priceMx: number;
  tags: string[];
}

@Component({
  selector: 'app-buyer-collaborator-menu-page',
  standalone: false,
  templateUrl: './buyer-collaborator-menu-page.component.html',
  styleUrl: './buyer-collaborator-menu-page.component.css',
})
export class BuyerCollaboratorMenuPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly collaboratorId = toSignal(
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
        id: 'd-1',
        name: 'Leche Santa Clara',
        description: 'Dona de vainilla con centro cremoso de chocolate y chispas de colores.',
        priceMx: 15,
        tags: ['vainilla', 'chocolate'],
      },
      {
        id: 'd-2',
        name: 'Glaseada Rosa',
        description: 'Masa suave glaseada con cobertura frutal y topping crocante.',
        priceMx: 17,
        tags: ['frutal', 'glaseada'],
      },
    ],
    bebidas: [
      {
        id: 'b-1',
        name: 'Frappe de Vainilla',
        description: 'Bebida fria con crema batida y toque de canela.',
        priceMx: 55,
        tags: ['frio', 'cremoso'],
      },
      {
        id: 'b-2',
        name: 'Iced Latte',
        description: 'Espresso con leche fria, hielo y jarabe ligero.',
        priceMx: 48,
        tags: ['cafe', 'hielo'],
      },
    ],
    galletas: [
      {
        id: 'g-1',
        name: 'Cookie Choco Chips',
        description: 'Galleta grande con chips de chocolate semiamargo.',
        priceMx: 22,
        tags: ['choco', 'artesanal'],
      },
      {
        id: 'g-2',
        name: 'Avena y Miel',
        description: 'Textura suave con avena integral y un toque de miel.',
        priceMx: 20,
        tags: ['avena', 'miel'],
      },
    ],
  };

  protected isActiveCategory(category: CollaboratorCategory): boolean {
    return this.selectedCategory() === category;
  }

  private parseCategory(raw: string | null): CollaboratorCategory {
    if (raw === 'donas' || raw === 'bebidas' || raw === 'galletas') {
      return raw;
    }
    return 'donas';
  }
}
