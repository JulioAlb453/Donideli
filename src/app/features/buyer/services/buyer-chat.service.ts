import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { AuthSessionService } from '../../../core/application/auth/auth-session.service';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../shared/services/notification.service';

export interface ChatMessage {
  sender_id: string;
  texto: string;
  timestamp: number;
  propio: boolean;
}

interface WSIncoming {
  type: string;
  room?: string;
  sender_id?: string;
  data?: { texto: string; timestamp: number };
}

const TOKEN_URL = `https://${environment.wsCollaborationHost}/auth/token`;
const WS_URL = `wss://${environment.wsCollaborationHost}/ws`;
const RECONNECT_DELAY = 3000;

@Injectable({ providedIn: 'root' })
export class BuyerChatService implements OnDestroy {
  private ws: WebSocket | null = null;
  private currentRoom = '';
  private cachedToken = '';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;

  private readonly auth: AuthSessionService;
  private readonly notificacion: NotificationService;
  private chatVisible = false;

  private readonly _mensajes = signal<ChatMessage[]>([]);
  private readonly _conectado = signal(false);
  private readonly _room_activo = signal('');

  readonly mensajes = this._mensajes.asReadonly();
  readonly conectado = this._conectado.asReadonly();
  readonly room_activo = this._room_activo.asReadonly();
  readonly total_mensajes = computed(() => this._mensajes().length);

  constructor(auth: AuthSessionService, notificacion: NotificationService) {
    this.auth = auth;
    this.notificacion = notificacion;
  }

  setChatVisible(visible: boolean): void {
    this.chatVisible = visible;
  }

  async conectar(): Promise<void> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.intentionalClose = false;

    try {
      this.cachedToken = await this.fetchToken();
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(this.cachedToken)}`);

    this.ws.onopen = () => {
      this._conectado.set(true);
      if (this.currentRoom) {
        this.enviarJoin(this.currentRoom);
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WSIncoming = JSON.parse(event.data as string);
        this.handleIncoming(msg);
      } catch { /* ignore */ }
    };

    this.ws.onclose = () => {
      this._conectado.set(false);
      this.ws = null;
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => this.ws?.close();
  }

  desconectar(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.currentRoom) {
      this.send({ type: 'leave', room: this.currentRoom });
    }
    this.ws?.close();
    this.ws = null;
    this._conectado.set(false);
    this._room_activo.set('');
    this.currentRoom = '';
  }

  entrar_room(id_colaborador: string): void {
    const userId = this.auth.currentUser()?.email ?? 'anonymous';
    const parts = [userId, id_colaborador].sort();
    const room = `chat:${parts[0]}:${parts[1]}`;

    if (this.currentRoom && this.currentRoom !== room) {
      this.send({ type: 'leave', room: this.currentRoom });
    }

    this.currentRoom = room;
    this._room_activo.set(room);
    this._mensajes.set([]);
    this.enviarJoin(room);
  }

  enviar_mensaje(texto: string): void {
    if (!texto.trim() || !this.currentRoom) return;

    const timestamp = Date.now();
    this.send({
      type: 'message',
      room: this.currentRoom,
      data: { texto: texto.trim(), timestamp },
    });

    this._mensajes.update((prev) => [
      ...prev,
      {
        sender_id: this.auth.currentUser()?.email ?? 'yo',
        texto: texto.trim(),
        timestamp,
        propio: true,
      },
    ]);
  }

  ngOnDestroy(): void {
    this.desconectar();
  }

  private handleIncoming(msg: WSIncoming): void {
    if (msg.type === 'message' && msg.data) {
      const sender = msg.sender_id ?? 'desconocido';
      const texto = msg.data.texto;

      this._mensajes.update((prev) => [
        ...prev,
        {
          sender_id: sender,
          texto,
          timestamp: msg.data!.timestamp ?? Date.now(),
          propio: false,
        },
      ]);

      if (!this.chatVisible) {
        this.notificacion.mensaje_chat(this.formatSender(sender), texto);
      }
    }
  }

  private formatSender(email: string): string {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  private async fetchToken(): Promise<string> {
    const userId = this.auth.currentUser()?.email ?? 'anonymous';
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error('Token request failed');
    const data: { token: string } = await res.json();
    return data.token;
  }

  private enviarJoin(room: string): void {
    this.send({ type: 'join', room });
  }

  private send(obj: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.conectar();
    }, RECONNECT_DELAY);
  }
}
