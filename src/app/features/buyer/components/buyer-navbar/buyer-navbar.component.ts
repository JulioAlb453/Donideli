import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../../../core/application/auth/auth-session.service';
import { BuyerCartService } from '../../services/buyer-cart.service';
import { BuyerChatService } from '../../services/buyer-chat.service';
import { BuyerChatContextService } from '../../services/buyer-chat-context.service';
import {
  BuyerMiPostulacionApiService,
  type BuyerMiPostulacionColaborador,
} from '../../services/buyer-mi-postulacion-api.service';
import {
  readPostulacionAlertDismissed,
  writePostulacionAlertDismissed,
} from './buyer-postulacion-alert.storage';

@Component({
  selector: 'app-buyer-navbar',
  standalone: false,
  templateUrl: './buyer-navbar.component.html',
  styleUrl: './buyer-navbar.component.css',
})
export class BuyerNavbarComponent implements OnInit {
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  protected readonly cart = inject(BuyerCartService);
  protected readonly chat = inject(BuyerChatService);
  private readonly chatCtx = inject(BuyerChatContextService);
  private readonly miPostulacionApi = inject(BuyerMiPostulacionApiService);

  protected readonly chat_panel_abierto = this.chatCtx.panelAbierto.asReadonly();

  private readonly miPostulacion = signal<BuyerMiPostulacionColaborador | null>(null);
  private readonly alertaDescartada = signal<string | null>(readPostulacionAlertDismissed());

  protected readonly alertaResolucionPostulacion = computed(() => {
    const p = this.miPostulacion();
    if (!p) {
      return null;
    }
    const est = (p.estado ?? '').trim().toLowerCase();
    if (est !== 'aceptada' && est !== 'rechazada') {
      return null;
    }
    const clave = `${p.id}:${est}`;
    if (this.alertaDescartada() === clave) {
      return null;
    }
    return p;
  });

  ngOnInit(): void {
    this.miPostulacionApi.fetchMiPostulacion().subscribe((p) => this.miPostulacion.set(p));
  }

  protected descartar_alerta_postulacion(): void {
    const p = this.alertaResolucionPostulacion();
    if (!p) {
      return;
    }
    writePostulacionAlertDismissed(p.id, p.estado);
    this.alertaDescartada.set(`${p.id}:${(p.estado ?? '').trim().toLowerCase()}`);
  }

  protected readonly rlaNav = [
    'font-semibold',
    'underline',
    'decoration-primary-700',
    'decoration-2',
    'underline-offset-4',
  ];

  protected logout(): void {
    this.authSession.logout();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  protected toggle_chat(): void {
    this.chatCtx.togglePanel();
  }
}
