import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

const CONFIRM_COLOR = '#f472b6';
const CANCEL_COLOR = '#6b7280';

const ChatToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
  showCloseButton: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

@Injectable({ providedIn: 'root' })
export class NotificationService {
  async confirmar(
    titulo: string,
    texto: string,
    textoBoton = 'Confirmar',
  ): Promise<boolean> {
    const result = await Swal.fire({
      title: titulo,
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: CONFIRM_COLOR,
      cancelButtonColor: CANCEL_COLOR,
      confirmButtonText: textoBoton,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });
    return result.isConfirmed;
  }

  async exito(titulo: string, texto?: string): Promise<void> {
    await Swal.fire({
      title: titulo,
      text: texto,
      icon: 'success',
      confirmButtonColor: CONFIRM_COLOR,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  async error(titulo: string, texto?: string): Promise<void> {
    await Swal.fire({
      title: titulo,
      text: texto,
      icon: 'error',
      confirmButtonColor: CONFIRM_COLOR,
    });
  }

  async info(titulo: string, texto?: string): Promise<void> {
    await Swal.fire({
      title: titulo,
      text: texto,
      icon: 'info',
      confirmButtonColor: CONFIRM_COLOR,
    });
  }

  mensaje_chat(remitente: string, texto: string): void {
    const preview = texto.length > 60 ? texto.slice(0, 57) + '…' : texto;
    void ChatToast.fire({
      icon: 'info',
      title: remitente,
      text: preview,
      iconColor: CONFIRM_COLOR,
    });
  }
}
