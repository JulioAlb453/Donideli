import { Injectable, signal } from '@angular/core';

const CENTRAL_CHAT_PEER_ALIAS = 'tienda';

const CENTRAL_CHAT_HEADER_LABEL = 'Tienda';

@Injectable({ providedIn: 'root' })
export class BuyerChatContextService {
  readonly idColaborador = signal(CENTRAL_CHAT_PEER_ALIAS);
  readonly nombre = signal(CENTRAL_CHAT_HEADER_LABEL);
  readonly panelAbierto = signal(false);

  setPeer(id: string, nombre: string): void {
    const idTrim = id.trim();
    const nameTrim = nombre.trim();
    this.idColaborador.set(idTrim || CENTRAL_CHAT_PEER_ALIAS);
    this.nombre.set(nameTrim || 'Colaborador');
  }

  openPanel(): void {
    this.panelAbierto.set(true);
  }

  closePanel(): void {
    this.panelAbierto.set(false);
  }

  togglePanel(): void {
    this.panelAbierto.update((v) => !v);
  }

  resetToCentralChat(): void {
    this.idColaborador.set(CENTRAL_CHAT_PEER_ALIAS);
    this.nombre.set(CENTRAL_CHAT_HEADER_LABEL);
  }
}
