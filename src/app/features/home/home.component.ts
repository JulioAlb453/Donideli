import { Component, signal } from '@angular/core';
import type { FlaticonIconName } from '../../shared/ui/flaticon-icon/flaticon-icons.config';

export interface CategoryCard {
  title: string;
  description: string;
  menuLink: string;
  flaticonIcon: FlaticonIconName;
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
        'Crujientes, con chips de chocolate o recetas caseras. El complemento perfecto para tu café.',
      menuLink: '#',
      flaticonIcon: 'cookie',
    },
    {
      title: 'Donas',
      description:
        'Glaseadas, rellenas y recién hechas. Elige tu favorita y endulza el día.',
      menuLink: '#',
      flaticonIcon: 'donut',
    },
    {
      title: 'Bebidas',
      description:
        'Cafés, smoothies y bebidas frías para acompañar tus postres.',
      menuLink: '#',
      flaticonIcon: 'milk-bottle',
    },
  ];

  protected readonly promoSlideIndex = signal(0);

  protected readonly promoSlideCount = 3;

  protected setPromoSlide(index: number): void {
    const safe = Math.max(0, Math.min(index, this.promoSlideCount - 1));
    this.promoSlideIndex.set(safe);
  }
}
