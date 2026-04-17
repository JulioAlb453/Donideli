export type UserRole = 'buyer' | 'admin';

export interface AuthUser {
  email: string;
  displayName: string;
  role: UserRole;
  /** Presente cuando el login fue contra el API (JWT). */
  accessToken?: string;
  userId?: string;
}
