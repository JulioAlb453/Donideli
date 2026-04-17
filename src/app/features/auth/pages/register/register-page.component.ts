import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../../../core/application/auth/auth-session.service';
import type { UserRole } from '../../../../core/domain/auth/auth-user.model';
import { RegistrationService } from '../../services/registration.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { BuyerCatalogRefreshService } from '../../../../core/application/buyer/buyer-catalog-refresh.service';

export type RegistroTipo = 'buyer' | 'admin' | 'collaborator';

@Component({
  selector: 'app-register-page',
  standalone: false,
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css',
})
export class RegisterPageComponent {
  private readonly registration = inject(RegistrationService);
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificationService);
  private readonly buyerCatalogRefresh = inject(BuyerCatalogRefreshService);

  protected readonly tipo = signal<RegistroTipo>('buyer');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly passwordConfirm = signal('');
  protected readonly displayName = signal('');
  protected readonly handle = signal('');
  protected readonly bio = signal('');
  protected readonly specialty = signal<'donas' | 'galletas' | 'bebidas'>('donas');
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly submitting = signal(false);

  protected setTipo(t: RegistroTipo): void {
    this.tipo.set(t);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  protected onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  protected onPasswordConfirmInput(event: Event): void {
    this.passwordConfirm.set((event.target as HTMLInputElement).value);
  }

  protected onDisplayNameInput(event: Event): void {
    this.displayName.set((event.target as HTMLInputElement).value);
  }

  protected onHandleInput(event: Event): void {
    this.handle.set((event.target as HTMLInputElement).value);
  }

  protected onBioInput(event: Event): void {
    this.bio.set((event.target as HTMLInputElement).value);
  }

  protected onSpecialtyChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    if (v === 'donas' || v === 'galletas' || v === 'bebidas') {
      this.specialty.set(v);
    }
  }

  protected async submitCompradorAdmin(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');
    const mail = this.email().trim().toLowerCase();
    const pass = this.password();
    const pass2 = this.passwordConfirm();

    if (!mail || !pass) {
      this.errorMessage.set('Completa correo y contraseña.');
      return;
    }
    if (pass.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (pass !== pass2) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.submitting.set(true);
    const role: UserRole = this.tipo() === 'admin' ? 'admin' : 'buyer';
    const reg =
      role === 'buyer'
        ? await this.registration.registrarComprador(mail, pass)
        : await this.registration.registrarAdmin(mail, pass);

    if (!reg.ok) {
      this.submitting.set(false);
      this.errorMessage.set(reg.message);
      return;
    }

    const loginOk = await this.authSession.login(mail, pass, role);
    this.submitting.set(false);
    if (!loginOk) {
      this.notificacion.perfil_creado('Cuenta creada. Inicia sesión con tus credenciales.');
      this.successMessage.set('Cuenta creada. Inicia sesión con tus credenciales.');
      return;
    }
    this.notificacion.perfil_creado('Bienvenido a DoniDeli.');
    void this.router.navigateByUrl(this.authSession.redirectForRole(role), { replaceUrl: true });
  }

  protected async submitColaborador(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');
    const mail = this.email().trim().toLowerCase();
    const name = this.displayName().trim();
    let h = this.handle().trim();
    const bioText = this.bio().trim();

    if (!mail || !name || !h) {
      this.errorMessage.set('Correo, nombre público y handle son obligatorios.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      this.errorMessage.set('Introduce un correo válido.');
      return;
    }
    if (!h.startsWith('@')) {
      h = `@${h.replace(/^@+/, '')}`;
    }

    this.submitting.set(true);
    const res = await this.registration.registrarColaborador({
      email: mail,
      display_name: name,
      handle: h,
      bio: bioText || null,
      specialty: this.specialty(),
      product_count: 0,
      sales_count: 0,
      is_online: false,
      status: 'active',
    });
    this.submitting.set(false);

    if (!res.ok) {
      this.errorMessage.set(res.message);
      return;
    }

    this.notificacion.perfil_creado(
      'Tu perfil de colaborador quedó registrado. El equipo lo activará en el catálogo.',
    );
    this.buyerCatalogRefresh.markStale();
    this.successMessage.set(
      'Perfil de colaborador creado. Aparecerás en el catálogo cuando el equipo active tu cuenta. Usa “Iniciar sesión” si también tienes cuenta de comprador o administrador.',
    );
    this.email.set('');
    this.displayName.set('');
    this.handle.set('');
    this.bio.set('');
  }

  protected async submit(): Promise<void> {
    if (this.tipo() === 'collaborator') {
      await this.submitColaborador();
      return;
    }
    await this.submitCompradorAdmin();
  }
}
