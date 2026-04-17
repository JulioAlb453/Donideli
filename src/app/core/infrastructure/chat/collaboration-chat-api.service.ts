import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../config/api-base-url.token';

export interface ChatMensajeApiDto {
  sender_id: string;
  texto: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class CollaborationChatApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  async listMensajes(room: string): Promise<ChatMensajeApiDto[]> {
    const base = this.apiBaseUrl.replace(/\/$/, '');
    const res = await firstValueFrom(
      this.http.get<{ mensajes: ChatMensajeApiDto[] }>(`${base}/chat/mensajes`, {
        params: { room },
      }),
    );
    return res.mensajes ?? [];
  }

  async guardarMensaje(room: string, texto: string, timestamp: number): Promise<void> {
    const base = this.apiBaseUrl.replace(/\/$/, '');
    await firstValueFrom(
      this.http.post(`${base}/chat/mensajes`, { room, texto, timestamp }),
    );
  }
}
