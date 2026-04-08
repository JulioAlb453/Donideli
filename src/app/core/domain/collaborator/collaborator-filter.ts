import type { Collaborator, CollaboratorCategory } from './collaborator.model';

export type CollaboratorCategoryFilter = 'all' | CollaboratorCategory;

export function filterCollaboratorsByCategory(
  collaborators: Collaborator[],
  filter: CollaboratorCategoryFilter,
): Collaborator[] {
  if (filter === 'all') {
    return collaborators;
  }
  return collaborators.filter((c) => c.specialty === filter);
}
