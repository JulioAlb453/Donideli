import { Component, signal } from '@angular/core';
import type { CollaboratorCategory } from '../../core/domain/collaborator/collaborator.model';
import type { FlaticonIconName } from '../../shared/ui/flaticon-icon/flaticon-icons.config';
export interface CategoryCard {
  title: string;
  description: string;
  flaticonIcon: FlaticonIconName;
  category: CollaboratorCategory;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected readonly tagline = 'Sacia tu antojo';

  protected readonly categories: CategoryCard[] = [
    {
      title: 'Galletas',
      description:
        'Crujientes, con chips de chocolate o recetas caseras. El complemento perfecto para tu cafe.',
      flaticonIcon: 'cookie',
      category: 'galletas',
    },
    {
      title: 'Donas',
      description:
        'Glaseadas, rellenas y recien hechas. Elige tu favorita y endulza el dia.',
      flaticonIcon: 'donut',
      category: 'donas',
    },
    {
      title: 'Bebidas',
      description:
        'Cafes, smoothies y bebidas frias para acompanar tus postres.',
      flaticonIcon: 'milk-bottle',
      category: 'bebidas',
    },
  ];

  protected readonly promoSlideIndex = signal(0);
  protected readonly promoSlideCount = 3;

  protected setPromoSlide(index: number): void {
    const safe = Math.max(0, Math.min(index, this.promoSlideCount - 1));
    this.promoSlideIndex.set(safe);
  }
}
