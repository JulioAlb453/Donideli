import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../../core/application/auth/auth-session.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { AdminChatService } from '../services/admin-chat.service';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificationService);
  private readonly adminChat = inject(AdminChatService);

  ngOnInit(): void {
    void this.adminChat.conectar();
  }

  ngOnDestroy(): void {
    this.adminChat.desconectar();
  }

  protected async logout(): Promise<void> {
    const confirmado = await this.notificacion.confirmar(
      'Cerrar sesión',
      '¿Seguro que deseas salir del panel de administración?',
      'Sí, salir',
    );
    if (confirmado) {
      this.authSession.logout();
      void this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
