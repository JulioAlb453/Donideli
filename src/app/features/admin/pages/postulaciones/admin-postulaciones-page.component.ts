import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { NotificationService } from '../../../../shared/services/notification.service';
import type { AdminPostulacionRow } from './admin-postulacion.model';

interface ApiListResponse {
  postulaciones?: AdminPostulacionRow[];
  total?: number;
}

@Component({
  selector: 'app-admin-postulaciones-page',
  standalone: false,
  templateUrl: './admin-postulaciones-page.component.html',
  styleUrl: './admin-postulaciones-page.component.css',
})
export class AdminPostulacionesPageComponent {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly notificacion = inject(NotificationService);

  private readonly refreshTick = signal(0);

  private readonly postulacionesRaw = toSignal(
    toObservable(this.refreshTick).pipe(
      switchMap(() => {
        const url = `${this.apiBaseUrl.replace(/\/$/, '')}/colaboradores/postulaciones/admin`;
        return this.http.get<ApiListResponse>(url).pipe(
          map((body) => (Array.isArray(body?.postulaciones) ? body.postulaciones! : [])),
          catchError((e) => {
            const msg = mensajeErrorLista(e);
            void this.notificacion.error('No se pudieron cargar las postulaciones', msg);
            return of([] as AdminPostulacionRow[]);
          }),
        );
      }),
    ),
    { initialValue: [] as AdminPostulacionRow[] },
  );

  protected readonly postulaciones = computed(() => {
    const list = this.postulacionesRaw();
    return [...list].sort((a, b) => {
      const ta = new Date(a.creado_en).getTime();
      const tb = new Date(b.creado_en).getTime();
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
    });
  });

  protected readonly total = computed(() => this.postulaciones().length);

  protected readonly slidebox_abierto = signal(false);

  protected recargar(): void {
    this.refreshTick.update((n) => n + 1);
  }

  protected abrir_slidebox(): void {
    this.slidebox_abierto.set(true);
  }

  protected cerrar_slidebox(): void {
    this.slidebox_abierto.set(false);
  }

}

function mensajeErrorLista(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { detail?: string };
    if (typeof body?.detail === 'string') {
      return body.detail;
    }
    if (err.status === 401 || err.status === 403) {
      return 'No tienes permiso para ver esta información.';
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }
  }
  return 'Intenta recargar la página.';
}
