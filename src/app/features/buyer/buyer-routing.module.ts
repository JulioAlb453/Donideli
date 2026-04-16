import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { BuyerCollaboratorsPageComponent } from './pages/collaborators/buyer-collaborators-page.component';
import { BuyerCollaboratorMenuPageComponent } from './pages/collaborator-menu/buyer-collaborator-menu-page.component';
import { BuyerCartPageComponent } from './pages/cart/buyer-cart-page.component';
import { BuyerCheckoutDatosPageComponent } from './pages/checkout/buyer-checkout-datos-page.component';
import { BuyerCheckoutPagoPageComponent } from './pages/checkout/buyer-checkout-pago-page.component';
import { BuyerOrdersPageComponent } from './pages/orders/buyer-orders-page.component';

const routes: Routes = [
  { path: 'inicio', component: HomeComponent },
  { path: 'colaboradores', component: BuyerCollaboratorsPageComponent },
  { path: 'colaborador/:id/menu', component: BuyerCollaboratorMenuPageComponent },
  { path: 'carrito', component: BuyerCartPageComponent },
  { path: 'checkout/datos', component: BuyerCheckoutDatosPageComponent },
  { path: 'checkout/pago', component: BuyerCheckoutPagoPageComponent },
  { path: 'pedidos', component: BuyerOrdersPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuyerRoutingModule {}
