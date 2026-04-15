import { Injectable, computed, signal } from '@angular/core';
import type { AuthUser, UserRole } from '../../domain/auth/auth-user.model';

interface CredentialSeed extends AuthUser {
  password: string;
}

const SESSION_STORAGE_KEY = 'donideli.auth.session';

const CREDENTIALS: CredentialSeed[] = [
  {
    email: 'comprador@donideli.com',
    password: 'buyer123',
    displayName: 'Comprador DoniDeli',
    role: 'buyer',
  },
  {
    email: 'admin@donideli.com',
    password: 'admin123',
    displayName: 'Admin DoniDeli',
    role: 'admin',
  },
];

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly currentUserState = signal<AuthUser | null>(this.readStoredSession());

  readonly currentUser = this.currentUserState.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserState() !== null);

  login(email: string, password: string, role: UserRole): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const match = CREDENTIALS.find(
      (entry) =>
        entry.email === normalizedEmail &&
        entry.password === password &&
        entry.role === role,
    );

    if (!match) {
      return false;
    }

    const user: AuthUser = {
      email: match.email,
      displayName: match.displayName,
      role: match.role,
    };

    this.currentUserState.set(user);
    this.persistSession(user);
    return true;
  }

  logout(): void {
    this.currentUserState.set(null);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  hasRole(role: UserRole): boolean {
    return this.currentUserState()?.role === role;
  }

  redirectForRole(role: UserRole): string {
    return role === 'admin' ? '/admin/productos' : '/buyer/inicio';
  }

  hydrateForTests(user: AuthUser): void {
    this.currentUserState.set(user);
  }

  private persistSession(user: AuthUser): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  }

  private readStoredSession(): AuthUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<AuthUser>;
      if (
        parsed &&
        typeof parsed.email === 'string' &&
        typeof parsed.displayName === 'string' &&
        (parsed.role === 'buyer' || parsed.role === 'admin')
      ) {
        return {
          email: parsed.email,
          displayName: parsed.displayName,
          role: parsed.role,
        };
      }
    } catch {
      // Ignora sesión inválida
    }

    return null;
  }
}
