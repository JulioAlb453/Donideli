import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { GetActiveCollaboratorsUseCase } from '../../core/application/collaborators/get-active-collaborators.use-case';
import { BuyerRoutingModule } from './buyer-routing.module';
import { HomeComponent } from '../home/home.component';
import { BuyerNavbarComponent } from './components/buyer-navbar/buyer-navbar.component';
import { CollaboratorCardComponent } from './components/collaborator-card/collaborator-card.component';
import { BuyerCollaboratorsPageComponent } from './pages/collaborators/buyer-collaborators-page.component';
import { BuyerCollaboratorMenuPageComponent } from './pages/collaborator-menu/buyer-collaborator-menu-page.component';
import { BuyerCatalogMenuPageComponent } from './pages/catalog-menu/buyer-catalog-menu-page.component';
import { BuyerCartPageComponent } from './pages/cart/buyer-cart-page.component';
import { BuyerCheckoutDatosPageComponent } from './pages/checkout/buyer-checkout-datos-page.component';
import { BuyerCheckoutPagoPageComponent } from './pages/checkout/buyer-checkout-pago-page.component';
import { BuyerOrdersPageComponent } from './pages/orders/buyer-orders-page.component';
import { BuyerChatComponent } from './components/buyer-chat/buyer-chat.component';

@NgModule({
  declarations: [
    HomeComponent,
    BuyerNavbarComponent,
    CollaboratorCardComponent,
    BuyerCollaboratorsPageComponent,
    BuyerCollaboratorMenuPageComponent,
    BuyerCatalogMenuPageComponent,
    BuyerCartPageComponent,
    BuyerCheckoutDatosPageComponent,
    BuyerCheckoutPagoPageComponent,
    BuyerOrdersPageComponent,
    BuyerChatComponent,
  ],
  imports: [CommonModule, FormsModule, SharedModule, BuyerRoutingModule],
  providers: [GetActiveCollaboratorsUseCase],
})
export class BuyerModule {}
