export type UserRole = 'buyer' | 'admin' | 'collaborator';

export interface AuthUser {
  email: string;
  displayName: string;
  role: UserRole;
  accessToken?: string;
  userId?: string;
}
