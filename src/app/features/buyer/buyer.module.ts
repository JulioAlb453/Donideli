import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { CollaboratorRepositoryPort } from '../../core/domain/collaborator/collaborator.repository.port';
import { CollaboratorInMemoryRepository } from '../../core/infrastructure/collaborators/collaborator-in-memory.repository';
import { BuyerRoutingModule } from './buyer-routing.module';
import { HomeComponent } from '../home/home.component';
import { BuyerNavbarComponent } from './components/buyer-navbar/buyer-navbar.component';
import { CollaboratorCardComponent } from './components/collaborator-card/collaborator-card.component';
import { BuyerCollaboratorsPageComponent } from './pages/collaborators/buyer-collaborators-page.component';
import { BuyerCollaboratorMenuPageComponent } from './pages/collaborator-menu/buyer-collaborator-menu-page.component';
import { BuyerCartPageComponent } from './pages/cart/buyer-cart-page.component';
import { BuyerCheckoutDatosPageComponent } from './pages/checkout/buyer-checkout-datos-page.component';
import { BuyerCheckoutPagoPageComponent } from './pages/checkout/buyer-checkout-pago-page.component';

@NgModule({
  declarations: [
    HomeComponent,
    BuyerNavbarComponent,
    CollaboratorCardComponent,
    BuyerCollaboratorsPageComponent,
    BuyerCollaboratorMenuPageComponent,
    BuyerCartPageComponent,
    BuyerCheckoutDatosPageComponent,
    BuyerCheckoutPagoPageComponent,
  ],
  imports: [CommonModule, FormsModule, SharedModule, BuyerRoutingModule],
  providers: [
    {
      provide: CollaboratorRepositoryPort,
      useClass: CollaboratorInMemoryRepository,
    },
  ],
})
export class BuyerModule {}
