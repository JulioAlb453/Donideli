export type UserRole = 'buyer' | 'admin';

export interface AuthUser {
  email: string;
  displayName: string;
  role: UserRole;
}
