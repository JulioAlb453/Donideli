import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
  effect,
  OnDestroy,
} from '@angular/core';
import { BuyerChatService } from '../../services/buyer-chat.service';
import { BuyerChatContextService } from '../../services/buyer-chat-context.service';

@Component({
  selector: 'app-buyer-chat',
  standalone: false,
  templateUrl: './buyer-chat.component.html',
  styleUrl: './buyer-chat.component.css',
})
export class BuyerChatComponent implements OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLElement>;

  protected readonly chat = inject(BuyerChatService);
  private readonly ctx = inject(BuyerChatContextService);

  protected readonly texto_input = signal('');
  protected readonly abierto = this.ctx.panelAbierto.asReadonly();
  protected readonly nombre = this.ctx.nombre.asReadonly();

  constructor() {
    effect(() => {
      const id = this.ctx.idColaborador();
      if (!id) {
        return;
      }
      void this.chat.conectar().then(async () => {
        await this.chat.entrar_room(id);
      });
    });

    effect(() => {
      this.chat.setChatVisible(this.ctx.panelAbierto());
    });

    effect(() => {
      if (this.ctx.panelAbierto()) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  ngOnDestroy(): void {
    this.chat.setChatVisible(false);
    this.chat.desconectar();
  }

  protected cerrar(): void {
    this.ctx.closePanel();
  }

  protected onInput(event: Event): void {
    this.texto_input.set((event.target as HTMLInputElement).value);
  }

  protected enviar(): void {
    const texto = this.texto_input().trim();
    if (!texto) return;
    this.chat.enviar_mensaje(texto);
    this.texto_input.set('');
    setTimeout(() => this.scrollToBottom(), 50);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviar();
    }
  }

  protected formato_hora(ts: number): string {
    return new Date(ts).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private scrollToBottom(): void {
    const el = this.scrollContainer?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
