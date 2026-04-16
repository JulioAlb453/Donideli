export type CollaboratorCategory = 'donas' | 'galletas' | 'bebidas';

export type CollaboratorStatus = 'active' | 'inactive';

export interface Collaborator {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  bio: string;
  specialty: CollaboratorCategory;
  productCount: number;
  salesCount: number;
  isOnline: boolean;
  status: CollaboratorStatus;
}
