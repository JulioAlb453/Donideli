import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { AdminChatService } from '../../services/admin-chat.service';

@Component({
  selector: 'app-admin-chat-panel',
  standalone: false,
  templateUrl: './admin-chat-panel.component.html',
  styleUrl: './admin-chat-panel.component.css',
})
export class AdminChatPanelComponent {
  @Output() closed = new EventEmitter<void>();
  @ViewChild('msgScroll') private msgScroll!: ElementRef<HTMLElement>;

  protected readonly chat = inject(AdminChatService);
  protected readonly texto = signal('');

  protected onInput(event: Event): void {
    this.texto.set((event.target as HTMLInputElement).value);
  }

  protected enviar(): void {
    const t = this.texto().trim();
    if (!t) return;
    this.chat.enviar_mensaje(t);
    this.texto.set('');
    setTimeout(() => this.scrollToBottom(), 50);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviar();
    }
  }

  protected abrir(room: string): void {
    this.chat.abrir_conversacion(room);
    setTimeout(() => this.scrollToBottom(), 50);
  }

  protected volver(): void {
    this.chat.cerrar_conversacion();
  }

  protected cerrar(): void {
    this.closed.emit();
  }

  protected nombre_corto(buyer_id: string): string {
    const at = buyer_id.indexOf('@');
    return at > 0 ? buyer_id.substring(0, at) : buyer_id;
  }

  protected inicial(buyer_id: string): string {
    return (this.nombre_corto(buyer_id).charAt(0) || '?').toUpperCase();
  }

  protected formato_hora(ts: number): string {
    return new Date(ts).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private scrollToBottom(): void {
    const el = this.msgScroll?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
