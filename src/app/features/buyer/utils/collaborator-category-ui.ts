import type { CollaboratorCategory } from '../../../core/domain/collaborator/collaborator.model';
import type { FlaticonIconName } from '../../../shared/ui/flaticon-icon/flaticon-icons.config';

export function collaboratorCategoryToFlaticon(
  category: CollaboratorCategory,
): FlaticonIconName {
  const map: Record<CollaboratorCategory, FlaticonIconName> = {
    donas: 'donut',
    galletas: 'cookie',
    bebidas: 'milk-bottle',
  };
  return map[category];
}

export function collaboratorCategoryLabel(category: CollaboratorCategory): string {
  const labels: Record<CollaboratorCategory, string> = {
    donas: 'Donas',
    galletas: 'Galletas',
    bebidas: 'Bebidas',
  };
  return labels[category];
}
