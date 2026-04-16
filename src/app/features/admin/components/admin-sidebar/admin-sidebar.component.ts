import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-admin-sidebar',
  standalone: false,
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css'],
})
export class AdminSidebarComponent {
  @Output() logoutClick = new EventEmitter<void>();

  protected readonly menu_abierto = signal(false);

  protected toggle_menu(): void {
    this.menu_abierto.update((v) => !v);
  }

  protected cerrar_menu(): void {
    this.menu_abierto.set(false);
  }

  protected on_nav_click(): void {
    this.menu_abierto.set(false);
  }

  protected on_logout(): void {
    this.menu_abierto.set(false);
    this.logoutClick.emit();
  }
}
