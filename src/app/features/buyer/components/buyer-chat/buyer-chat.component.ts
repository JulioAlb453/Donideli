import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { BuyerChatService } from '../../services/buyer-chat.service';

@Component({
  selector: 'app-buyer-chat',
  standalone: false,
  templateUrl: './buyer-chat.component.html',
  styleUrl: './buyer-chat.component.css',
})
export class BuyerChatComponent implements OnChanges, OnDestroy {
  @Input() id_colaborador = '';
  @Input() nombre = 'Colaborador';

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLElement>;

  protected readonly chat = inject(BuyerChatService);
  protected readonly abierto = signal(false);
  protected readonly texto_input = signal('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id_colaborador'] && this.id_colaborador) {
      void this.chat.conectar().then(() => {
        this.chat.entrar_room(this.id_colaborador);
      });
    }
  }

  ngOnDestroy(): void {
    this.chat.setChatVisible(false);
    this.chat.desconectar();
  }

  protected toggle(): void {
    this.abierto.update((v) => !v);
    this.chat.setChatVisible(this.abierto());
    if (this.abierto()) {
      setTimeout(() => this.scrollToBottom(), 50);
    }
  }

  protected cerrar(): void {
    this.abierto.set(false);
    this.chat.setChatVisible(false);
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
