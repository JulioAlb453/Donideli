import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, merge, of } from 'rxjs';
export type FutureUpdatesArea = 'general' | 'colaboradores' | 'postulantes';

@Component({
  selector: 'app-admin-future-updates-page',
  standalone: false,
  templateUrl: './admin-future-updates-page.component.html',
  styleUrl: './admin-future-updates-page.component.css',
})
export class AdminFutureUpdatesPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly area = toSignal(
    merge(
      of(null),
      this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)),
    ).pipe(map(() => this.readAreaFromRoute())),
    { initialValue: this.readAreaFromRoute() },
  );

  protected readonly pageHeading = computed(() => {
    switch (this.area()) {
      case 'colaboradores':
        return 'Colaboradores (admin)';
      case 'postulantes':
        return 'Postulantes';
      default:
        return 'Próximas actualizaciones';
    }
  });

  private readAreaFromRoute(): FutureUpdatesArea {
    const v = this.route.snapshot.data['futureArea'];
    if (v === 'postulantes' || v === 'colaboradores') {
      return v;
    }
    return 'general';
  }

}
