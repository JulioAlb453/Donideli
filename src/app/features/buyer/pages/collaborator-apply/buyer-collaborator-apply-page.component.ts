import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthSessionService } from '../../../../core/application/auth/auth-session.service';
import {
  BuyerPostulacionColaboradorApiService,
  type SpecialtyPostulacion,
} from '../../services/buyer-postulacion-colaborador-api.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-buyer-collaborator-apply-page',
  standalone: false,
  templateUrl: './buyer-collaborator-apply-page.component.html',
  styleUrl: './buyer-collaborator-apply-page.component.css',
})
export class BuyerCollaboratorApplyPageComponent {
  private readonly api = inject(BuyerPostulacionColaboradorApiService);
  private readonly notificacion = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthSessionService);

  protected readonly enviando = signal(false);

  /** Mismo valor que usa el login (en la API es `nombre` del comprador). */
  protected readonly correoVinculado = computed(() => this.auth.currentUser()?.email?.trim() ?? null);

  protected modelo = {
    nombre_completo: '',
    email: '',
    telefono: '',
    specialty: '' as '' | SpecialtyPostulacion,
    mensaje: '',
  };

  constructor() {
    effect(() => {
      const c = this.correoVinculado();
      if (c) {
        this.modelo.email = c;
      }
    });
  }

  protected readonly opcionesEspecialidad: { id: SpecialtyPostulacion; label: string }[] = [
    { id: 'donas', label: 'Donas' },
    { id: 'galletas', label: 'Galletas' },
    { id: 'bebidas', label: 'Bebidas' },
  ];

  protected async enviar(): Promise<void> {
    const nombre = this.modelo.nombre_completo.trim();
    const email = this.modelo.email.trim();
    const telefono = this.modelo.telefono.trim();
    const specialty = this.modelo.specialty;

    if (nombre.length < 2) {
      void this.notificacion.error('Datos incompletos', 'Indica tu nombre completo.');
      return;
    }
    if (!email || email.length < 3) {
      void this.notificacion.error('Datos incompletos', 'Indica un correo o identificador de contacto.');
      return;
    }
    if (!this.correoVinculado() && !email.includes('@')) {
      void this.notificacion.error(
        'Datos incompletos',
        'Indica un correo electrónico válido (debe incluir @) o inicia sesión para vincular tu cuenta.',
      );
      return;
    }
    if (telefono.length < 8) {
      void this.notificacion.error('Datos incompletos', 'Indica un teléfono de contacto (mínimo 8 caracteres).');
      return;
    }
    if (!specialty) {
      void this.notificacion.error('Datos incompletos', 'Selecciona la especialidad en la que deseas colaborar.');
      return;
    }

    this.enviando.set(true);
    try {
      const res = await firstValueFrom(
        this.api.enviar({
          nombre_completo: nombre,
          email,
          telefono,
          specialty,
          mensaje: this.modelo.mensaje.trim() || undefined,
        }),
      );
      await this.notificacion.exito('Postulación enviada', res.mensaje);
      void this.router.navigateByUrl('/buyer/colaboradores', { replaceUrl: false });
    } catch (e) {
      const msg = mensajeErrorEnvio(e);
      void this.notificacion.error('No se pudo enviar', msg);
    } finally {
      this.enviando.set(false);
    }
  }
}

function mensajeErrorEnvio(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { detail?: string };
    if (typeof body?.detail === 'string') {
      return body.detail;
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Intenta más tarde.';
    }
  }
  return 'Ocurrió un error al enviar tu postulación.';
}
