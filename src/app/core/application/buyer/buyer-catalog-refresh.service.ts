import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class BuyerCatalogRefreshService {
  private readonly router = inject(Router);
  private readonly _epoch = signal(0);
  readonly epoch = this._epoch.asReadonly();

  constructor() {
    let urlPrev = '';
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = e.urlAfterRedirects;
        if (urlPrev.includes('/admin') && url.includes('/buyer')) {
          this.markStale();
        }
        urlPrev = url;
      });
  }

  markStale(): void {
    this._epoch.update((n) => n + 1);
  }
}
