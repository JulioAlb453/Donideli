import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../../../core/application/auth/auth-session.service';
import { BuyerCartService } from '../../services/buyer-cart.service';

@Component({
  selector: 'app-buyer-navbar',
  standalone: false,
  templateUrl: './buyer-navbar.component.html',
  styleUrl: './buyer-navbar.component.css',
})
export class BuyerNavbarComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  protected readonly cart = inject(BuyerCartService);

  protected readonly rlaNav = [
    'font-semibold',
    'underline',
    'decoration-primary-700',
    'decoration-2',
    'underline-offset-4',
  ];

  protected logout(): void {
    this.authSession.logout();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
