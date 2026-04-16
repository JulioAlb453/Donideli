import { Injectable, signal, computed, OnDestroy, inject } from '@angular/core';
import { NotificationService } from '../../../shared/services/notification.service';

export interface AdminChatMessage {
  sender_id: string;
  texto: string;
  timestamp: number;
  propio: boolean;
}

export interface AdminConversation {
  room: string;
  buyer_id: string;
  mensajes: AdminChatMessage[];
  no_leidos: number;
}

interface WSIncoming {
  type: string;
  room?: string;
  sender_id?: string;
  data?: { texto: string; timestamp: number };
}

const WS_BASE = 'wb-donideli.fly.dev';
const TOKEN_URL = `https://${WS_BASE}/auth/token`;
const WS_URL = `wss://${WS_BASE}/ws`;
const RECONNECT_DELAY = 3000;
const ADMIN_USER_ID = 'admin@donideli.com';

@Injectable({ providedIn: 'root' })
export class AdminChatService implements OnDestroy {
  private readonly notificacion = inject(NotificationService);
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;
  private joinedRooms = new Set<string>();

  private readonly _conectado = signal(false);
  private readonly _conversaciones = signal<Map<string, AdminConversation>>(new Map());
  private readonly _room_activo = signal<string | null>(null);

  readonly conectado = this._conectado.asReadonly();
  readonly room_activo = this._room_activo.asReadonly();

  readonly total_no_leidos = computed(() => {
    let total = 0;
    for (const conv of this._conversaciones().values()) {
      total += conv.no_leidos;
    }
    return total;
  });

  readonly conversaciones_list = computed(() =>
    Array.from(this._conversaciones().values()).sort((a, b) => {
      const lastA = a.mensajes.at(-1)?.timestamp ?? 0;
      const lastB = b.mensajes.at(-1)?.timestamp ?? 0;
      return lastB - lastA;
    }),
  );

  readonly mensajes_activos = computed(() => {
    const room = this._room_activo();
    if (!room) return [];
    return this._conversaciones().get(room)?.mensajes ?? [];
  });

  async conectar(): Promise<void> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.intentionalClose = false;

    let token: string;
    try {
      token = await this.fetchToken();
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);

    this.ws.onopen = () => {
      this._conectado.set(true);
      for (const room of this.joinedRooms) {
        this.send({ type: 'join', room });
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
    this.ws?.close();
    this.ws = null;
    this._conectado.set(false);
  }

  entrar_room(buyer_id: string): void {
    const room = this.buildRoom(buyer_id);
    this.joinedRooms.add(room);

    const convs = new Map(this._conversaciones());
    if (!convs.has(room)) {
      convs.set(room, { room, buyer_id, mensajes: [], no_leidos: 0 });
      this._conversaciones.set(convs);
    }

    this.send({ type: 'join', room });
  }

  abrir_conversacion(room: string): void {
    this._room_activo.set(room);
    const convs = new Map(this._conversaciones());
    const conv = convs.get(room);
    if (conv && conv.no_leidos > 0) {
      convs.set(room, { ...conv, no_leidos: 0 });
      this._conversaciones.set(convs);
    }
  }

  cerrar_conversacion(): void {
    this._room_activo.set(null);
  }

  enviar_mensaje(texto: string): void {
    const room = this._room_activo();
    if (!texto.trim() || !room) return;

    const timestamp = Date.now();
    this.send({
      type: 'message',
      room,
      data: { texto: texto.trim(), timestamp },
    });

    const convs = new Map(this._conversaciones());
    const conv = convs.get(room);
    if (conv) {
      convs.set(room, {
        ...conv,
        mensajes: [
          ...conv.mensajes,
          { sender_id: ADMIN_USER_ID, texto: texto.trim(), timestamp, propio: true },
        ],
      });
      this._conversaciones.set(convs);
    }
  }

  ngOnDestroy(): void {
    this.desconectar();
  }

  private handleIncoming(msg: WSIncoming): void {
    if (msg.type !== 'message' || !msg.data || !msg.room) return;

    const room = msg.room;
    const sender = msg.sender_id ?? 'desconocido';
    const texto = msg.data.texto;
    const convs = new Map(this._conversaciones());
    let conv = convs.get(room);

    if (!conv) {
      const buyerId = this.extractBuyerFromRoom(room);
      conv = { room, buyer_id: buyerId, mensajes: [], no_leidos: 0 };
    }

    const isActive = this._room_activo() === room;
    convs.set(room, {
      ...conv,
      mensajes: [
        ...conv.mensajes,
        {
          sender_id: sender,
          texto,
          timestamp: msg.data.timestamp ?? Date.now(),
          propio: false,
        },
      ],
      no_leidos: isActive ? 0 : conv.no_leidos + 1,
    });
    this._conversaciones.set(convs);

    if (!isActive) {
      this.notificacion.mensaje_chat(this.formatSender(sender), texto);
    }
  }

  private formatSender(email: string): string {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  private async fetchToken(): Promise<string> {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: ADMIN_USER_ID }),
    });
    if (!res.ok) throw new Error('Token request failed');
    const data: { token: string } = await res.json();
    return data.token;
  }

  private buildRoom(buyer_id: string): string {
    const parts = [buyer_id, ADMIN_USER_ID].sort();
    return `chat:${parts[0]}:${parts[1]}`;
  }

  private extractBuyerFromRoom(room: string): string {
    const parts = room.replace('chat:', '').split(':');
    return parts.find((p) => p !== ADMIN_USER_ID) ?? parts[0];
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
