import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthSessionService } from '../../core/application/auth/auth-session.service';
import type { Collaborator, CollaboratorCategory } from '../../core/domain/collaborator/collaborator.model';
import { CollaboratorRepositoryPort } from '../../core/domain/collaborator/collaborator.repository.port';
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
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly collaboratorRepo = inject(CollaboratorRepositoryPort);

  private readonly collaborators = toSignal(this.collaboratorRepo.findAllActive(), {
    initialValue: [] as Collaborator[],
  });

  /** Primer colaborador del API para enlazar al menú; si no hay datos, ir al área comprador. */
  protected readonly menuColaboradorBasePath = computed((): string[] => {
    const first = this.collaborators()[0];
    if (first?.id) {
      return ['/buyer', 'colaborador', first.id, 'menu'];
    }
    return ['/buyer', 'inicio'];
  });

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

  protected logout(): void {
    this.authSession.logout();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
