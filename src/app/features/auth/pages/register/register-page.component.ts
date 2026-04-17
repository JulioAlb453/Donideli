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
  protected readonly handleColaboradorOpcional = signal('');
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly submitting = signal(false);

  protected setTipo(t: RegistroTipo): void {
    this.tipo.set(t);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.password.set('');
    this.passwordConfirm.set('');
    this.handleColaboradorOpcional.set('');
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

  protected onHandleColaboradorOpcionalInput(event: Event): void {
    this.handleColaboradorOpcional.set((event.target as HTMLInputElement).value);
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
    const pass = this.password();
    const pass2 = this.passwordConfirm();
    const handleOpt = this.handleColaboradorOpcional().trim();

    if (!mail) {
      this.errorMessage.set('Indica el correo que usaste en tu postulación.');
      return;
    }
    if (!pass || pass.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (pass !== pass2) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      this.errorMessage.set('Introduce un correo válido.');
      return;
    }

    this.submitting.set(true);
    const res = await this.registration.activarCuentaColaborador(mail, pass, handleOpt || undefined);
    this.submitting.set(false);

    if (!res.ok) {
      this.errorMessage.set(res.message);
      return;
    }

    this.notificacion.perfil_creado('Cuenta activada. Ya puedes iniciar sesión como colaborador.');
    this.buyerCatalogRefresh.markStale();
    this.successMessage.set(
      'Listo. Inicia sesión en DoniDeli como «Colaborador» con este correo y contraseña. Nombre y especialidad se tomaron de tu postulación aceptada.',
    );
    this.email.set('');
    this.password.set('');
    this.passwordConfirm.set('');
    this.handleColaboradorOpcional.set('');
  }

  protected async submit(): Promise<void> {
    if (this.tipo() === 'collaborator') {
      await this.submitColaborador();
      return;
    }
    await this.submitCompradorAdmin();
  }
}
