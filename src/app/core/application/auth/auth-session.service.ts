import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../config/api-base-url.token';
import type { AuthUser, UserRole } from '../../domain/auth/auth-user.model';
import { AUTH_SESSION_STORAGE_KEY } from './auth-session.storage';

interface CredentialSeed extends AuthUser {
  password: string;
}

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

interface ApiLoginResponse {
  id: number;
  email: string;
  display_name?: string;
  nombre?: string;
  role: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private readonly currentUserState = signal<AuthUser | null>(this.readStoredSession());

  readonly currentUser = this.currentUserState.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserState() !== null);

  async login(email: string, password: string, role: UserRole): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    if (this.apiBaseUrl) {
      return this.loginWithApi(normalizedEmail, password, role);
    }
    return this.loginInMemory(normalizedEmail, password, role);
  }

  logout(): void {
    this.currentUserState.set(null);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
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

  private async loginWithApi(
    normalizedEmail: string,
    password: string,
    role: UserRole,
  ): Promise<boolean> {
    const path = role === 'buyer' ? '/compradores/login' : '/admins/login';
    const url = `${this.apiBaseUrl.replace(/\/$/, '')}${path}`;
    try {
      const res = await firstValueFrom(
        this.http.post<ApiLoginResponse>(url, {
          email: normalizedEmail,
          contrasena: password,
        }),
      );
      const apiRole = res.role === 'admin' ? 'admin' : 'buyer';
      if (apiRole !== role) {
        return false;
      }
      const user: AuthUser = {
        email: res.email,
        displayName: res.display_name ?? res.nombre ?? res.email,
        role: apiRole,
        accessToken: res.token,
        userId: String(res.id),
      };
      this.currentUserState.set(user);
      this.persistSession(user);
      return true;
    } catch {
      return false;
    }
  }

  private loginInMemory(
    normalizedEmail: string,
    password: string,
    role: UserRole,
  ): boolean {
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

  private persistSession(user: AuthUser): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(user));
  }

  private readStoredSession(): AuthUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = window.sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
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
          accessToken:
            typeof parsed.accessToken === 'string' ? parsed.accessToken : undefined,
          userId: typeof parsed.userId === 'string' ? parsed.userId : undefined,
        };
      }
    } catch {
      /* ignorar */
    }

    return null;
  }
}
