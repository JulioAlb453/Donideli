import { Component } from '@angular/core';

@Component({
  selector: 'app-buyer-navbar',
  standalone: false,
  templateUrl: './buyer-navbar.component.html',
  styleUrl: './buyer-navbar.component.css',
})
export class BuyerNavbarComponent {

  protected readonly rlaNav = [
    'font-semibold',
    'underline',
    'decoration-primary-700',
    'decoration-2',
    'underline-offset-4',
  ];
}
