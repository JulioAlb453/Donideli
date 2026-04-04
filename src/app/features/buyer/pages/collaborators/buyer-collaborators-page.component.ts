import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GetActiveCollaboratorsUseCase } from '../../../../core/application/collaborators/get-active-collaborators.use-case';
import {
  filterCollaboratorsByCategory,
  type CollaboratorCategoryFilter,
} from '../../../../core/domain/collaborator/collaborator-filter';
import type { CollaboratorCategory } from '../../../../core/domain/collaborator/collaborator.model';

@Component({
  selector: 'app-buyer-collaborators-page',
  standalone: false,
  templateUrl: './buyer-collaborators-page.component.html',
  styleUrl: './buyer-collaborators-page.component.css',
})
export class BuyerCollaboratorsPageComponent {
  private readonly getActiveCollaborators = inject(GetActiveCollaboratorsUseCase);

  private readonly collaborators = toSignal(this.getActiveCollaborators.execute(), {
    initialValue: [],
  });

  protected readonly categoryFilter = signal<CollaboratorCategoryFilter>('all');

  protected readonly filteredCollaborators = computed(() =>
    filterCollaboratorsByCategory(this.collaborators(), this.categoryFilter()),
  );

  protected readonly filterOptions: { id: CollaboratorCategoryFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'donas', label: 'Donas' },
    { id: 'galletas', label: 'Galletas' },
    { id: 'bebidas', label: 'Bebidas' },
  ];

  protected setFilter(id: CollaboratorCategoryFilter): void {
    this.categoryFilter.set(id);
  }

  protected isFilterActive(id: CollaboratorCategoryFilter): boolean {
    return this.categoryFilter() === id;
  }
}
