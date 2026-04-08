import { Component, Input } from '@angular/core';
import type {
  Collaborator,
  CollaboratorCategory,
} from '../../../../core/domain/collaborator/collaborator.model';
import {
  collaboratorCategoryLabel,
  collaboratorCategoryToFlaticon,
} from '../../utils/collaborator-category-ui';

@Component({
  selector: 'app-collaborator-card',
  standalone: false,
  templateUrl: './collaborator-card.component.html',
  styleUrl: './collaborator-card.component.css',
})
export class CollaboratorCardComponent {
  @Input({ required: true }) collaborator!: Collaborator;

  protected flaticonFor(category: CollaboratorCategory) {
    return collaboratorCategoryToFlaticon(category);
  }

  protected menuLabel(category: CollaboratorCategory): string {
    return `Menu: ${collaboratorCategoryLabel(category)}`;
  }

  protected accentStripClass(category: CollaboratorCategory): string {
    const map: Record<CollaboratorCategory, string> = {
      donas: 'border-t-4 border-secondary-400',
      galletas: 'border-t-4 border-primary-600',
      bebidas: 'border-t-4 border-accent-500',
    };
    return map[category];
  }

  protected avatarBgClass(category: CollaboratorCategory): string {
    const map: Record<CollaboratorCategory, string> = {
      donas: 'bg-secondary-200',
      galletas: 'bg-primary-200',
      bebidas: 'bg-accent-100',
    };
    return map[category];
  }

  protected badgeClass(category: CollaboratorCategory): string {
    const map: Record<CollaboratorCategory, string> = {
      donas: 'bg-secondary-100 text-primary-800 ring-secondary-300',
      galletas: 'bg-primary-100 text-primary-800 ring-primary-300',
      bebidas: 'bg-accent-50 text-primary-800 ring-accent-200',
    };
    return map[category];
  }

  protected initial(name: string): string {
    return name.trim().charAt(0).toUpperCase() || '?';
  }
}
