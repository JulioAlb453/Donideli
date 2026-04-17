import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import type { AdminPostulacionRow } from '../../pages/postulaciones/admin-postulacion.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AdminChatService } from '../../services/admin-chat.service';

@Component({
  selector: 'app-admin-postulaciones-slidebox',
  standalone: false,
  templateUrl: './admin-postulaciones-slidebox.component.html',
  styleUrl: './admin-postulaciones-slidebox.component.css',
})
export class AdminPostulacionesSlideboxComponent {
  readonly postulaciones = input.required<AdminPostulacionRow[]>();
  readonly closed = output<void>();
  readonly refresh = output<void>();

  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly notificacion = inject(NotificationService);
  protected readonly adminChat = inject(AdminChatService);

  protected readonly detalle = signal<AdminPostulacionRow | null>(null);
  protected readonly procesando_id = signal<number | null>(null);
  protected readonly panel_notificaciones_abierto = signal(false);
  protected readonly texto_notif = signal('');

  protected readonly plantillas_postulacion: { label: string; texto: string }[] = [
    {
      label: 'Postulación aceptada',
      texto:
        'Hola, te informamos que tu postulación como colaborador en DoniDeli fue aceptada. Pronto nos comunicamos contigo con los siguientes pasos.',
    },
    {
      label: 'Postulación no aprobada',
      texto:
        'Hola, lamentamos informarte que en esta ocasión tu postulación como colaborador no fue aprobada. Agradecemos tu interés.',
    },
    {
      label: 'En revisión',
      texto:
        'Tu postulación como colaborador sigue en revisión. Te avisaremos por aquí cuando tengamos una resolución.',
    },
  ];

  protected readonly plantillas_pedido: { label: string; texto: string }[] = [
    {
      label: 'Pedido en preparación',
      texto:
        'Actualización de tu pedido: lo estamos preparando. Gracias por tu compra en DoniDeli.',
    },
    {
      label: 'Pedido en camino',
      texto:
        'Tu pedido va en camino. Si tienes alguna duda sobre la entrega, puedes responder en este chat.',
    },
    {
      label: 'Pedido entregado',
      texto:
        'Tu pedido fue marcado como entregado. ¡Esperamos que lo disfrutes! Gracias por elegir DoniDeli.',
    },
    {
      label: 'Pedido con demora',
      texto:
        'Te avisamos que tu pedido tiene un pequeño retraso. Estamos trabajando para enviarlo lo antes posible.',
    },
  ];

  protected readonly ultimos_mensajes_chat = computed(() => this.adminChat.mensajes_activos().slice(-10));

  @HostListener('document:keydown.escape')
  protected on_escape(): void {
    if (this.panel_notificaciones_abierto()) {
      this.panel_notificaciones_abierto.set(false);
      return;
    }
    if (this.detalle()) {
      this.volver_al_listado();
      return;
    }
    this.cerrar();
  }

  protected cerrar(): void {
    this.panel_notificaciones_abierto.set(false);
    this.texto_notif.set('');
    this.detalle.set(null);
    this.closed.emit();
  }

  protected solicitar_actualizar(): void {
    this.refresh.emit();
  }

  protected ver_detalle(p: AdminPostulacionRow, event?: Event): void {
    event?.stopPropagation();
    this.panel_notificaciones_abierto.set(false);
    this.texto_notif.set('');
    this.detalle.set(p);
  }

  protected volver_al_listado(): void {
    this.panel_notificaciones_abierto.set(false);
    this.texto_notif.set('');
    this.detalle.set(null);
  }

  protected async toggle_panel_notificaciones(p: AdminPostulacionRow): Promise<void> {
    if (this.panel_notificaciones_abierto()) {
      this.panel_notificaciones_abierto.set(false);
      return;
    }
    await this.adminChat.conectar();
    await this.adminChat.abrir_chat_con_comprador(p.email);
    this.panel_notificaciones_abierto.set(true);
  }

  protected abrir_notificaciones_desde_lista(p: AdminPostulacionRow, ev: Event): void {
    ev.stopPropagation();
    this.detalle.set(p);
    void this.toggle_panel_notificaciones(p);
  }

  protected on_text_notif(ev: Event): void {
    this.texto_notif.set((ev.target as HTMLTextAreaElement).value);
  }

  protected aplicar_plantilla(texto: string): void {
    this.texto_notif.set(texto);
  }

  protected enviar_notificacion_chat(): void {
    const t = this.texto_notif().trim();
    if (!t) {
      void this.notificacion.info('Mensaje vacío', 'Escribe un mensaje o elige una plantilla.');
      return;
    }
    if (!this.adminChat.conectado()) {
      void this.notificacion.error(
        'Chat sin conexión',
        'Espera unos segundos a que se conecte el chat o pulsa de nuevo en Notificaciones.',
      );
      return;
    }
    this.adminChat.enviar_mensaje(t);
    this.texto_notif.set('');
    void this.notificacion.exito('Mensaje enviado', 'El comprador lo verá en su chat con DoniDeli.');
  }

  protected etiqueta_especialidad(code: string): string {
    const c = (code ?? '').toLowerCase();
    if (c === 'donas') return 'Donas';
    if (c === 'galletas') return 'Galletas';
    if (c === 'bebidas') return 'Bebidas';
    return code || '—';
  }

  protected etiqueta_estado(estado: string): string {
    const e = (estado ?? '').trim().toLowerCase();
    if (e === 'pendiente') return 'Pendiente';
    if (e === 'aceptada') return 'Aceptada';
    if (e === 'rechazada') return 'Rechazada';
    return estado || '—';
  }

  protected es_pendiente(p: AdminPostulacionRow): boolean {
    return (p.estado ?? '').trim().toLowerCase() === 'pendiente';
  }

  protected iniciales(nombre: string): string {
    const partes = (nombre ?? '').trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '?';
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  protected formato_hora_chat(ts: number): string {
    return new Date(ts).toLocaleString('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  protected async aceptar(p: AdminPostulacionRow): Promise<void> {
    await this.cambiar_estado(p.id, 'aceptada', 'Postulación aceptada');
  }

  protected async declinar(p: AdminPostulacionRow): Promise<void> {
    const ok = await this.notificacion.confirmar(
      'Declinar postulación',
      '¿Marcar esta solicitud como rechazada? El postulante quedará registrado con ese estado.',
      'Sí, declinar',
    );
    if (!ok) {
      return;
    }
    await this.cambiar_estado(p.id, 'rechazada', 'Postulación rechazada');
  }

  private async cambiar_estado(
    id: number,
    estado: 'aceptada' | 'rechazada',
    tituloExito: string,
  ): Promise<void> {
    this.procesando_id.set(id);
    try {
      const base = this.apiBaseUrl.replace(/\/$/, '');
      const actualizado = await firstValueFrom(
        this.http.patch<AdminPostulacionRow>(`${base}/colaboradores/postulaciones/${id}/estado`, {
          estado,
        }),
      );
      if (this.detalle()?.id === id) {
        this.detalle.set(actualizado);
      }
      await this.notificacion.exito(tituloExito);
      this.refresh.emit();
    } catch (e) {
      const msg = mensaje_error_http(e);
      void this.notificacion.error('No se pudo actualizar', msg);
    } finally {
      this.procesando_id.set(null);
    }
  }
}

function mensaje_error_http(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { detail?: string };
    if (typeof body?.detail === 'string') {
      return body.detail;
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }
  }
  return 'Intenta de nuevo en unos momentos.';
}
