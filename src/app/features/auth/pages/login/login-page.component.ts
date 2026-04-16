import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../../../core/application/auth/auth-session.service';
import type { UserRole } from '../../../../core/domain/auth/auth-user.model';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  protected readonly role = signal<UserRole>('buyer');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly errorMessage = signal('');

  constructor() {
    this.setRole('buyer');

    effect(() => {
      const active = this.authSession.currentUser();
      if (active) {
        void this.router.navigateByUrl(this.authSession.redirectForRole(active.role));
      }
    });
  }

  protected setRole(role: UserRole): void {
    this.role.set(role);
    this.errorMessage.set('');

    if (role === 'buyer') {
      this.email.set('comprador@donideli.com');
      this.password.set('buyer123');
      return;
    }

    this.email.set('admin@donideli.com');
    this.password.set('admin123');
  }

  protected onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  protected onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  protected submit(): void {
    const ok = this.authSession.login(
      this.email(),
      this.password(),
      this.role(),
    );

    if (!ok) {
      this.errorMessage.set('Credenciales incorrectas para el rol seleccionado.');
      return;
    }

    this.errorMessage.set('');
    void this.router.navigateByUrl(this.authSession.redirectForRole(this.role()), {
      replaceUrl: true,
    });
  }
}
