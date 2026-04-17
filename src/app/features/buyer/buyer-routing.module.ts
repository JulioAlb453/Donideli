import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { BuyerShellLayoutComponent } from './layout/buyer-shell-layout.component';
import { BuyerCollaboratorsPageComponent } from './pages/collaborators/buyer-collaborators-page.component';
import { BuyerCollaboratorMenuPageComponent } from './pages/collaborator-menu/buyer-collaborator-menu-page.component';
import { BuyerCatalogMenuPageComponent } from './pages/catalog-menu/buyer-catalog-menu-page.component';
import { BuyerCartPageComponent } from './pages/cart/buyer-cart-page.component';
import { BuyerCheckoutDatosPageComponent } from './pages/checkout/buyer-checkout-datos-page.component';
import { BuyerCheckoutPagoPageComponent } from './pages/checkout/buyer-checkout-pago-page.component';
import { BuyerOrdersPageComponent } from './pages/orders/buyer-orders-page.component';
import { BuyerCollaboratorApplyPageComponent } from './pages/collaborator-apply/buyer-collaborator-apply-page.component';

const routes: Routes = [
  {
    path: '',
    component: BuyerShellLayoutComponent,
    children: [
      { path: 'inicio', component: HomeComponent },
      { path: 'colaboradores', component: BuyerCollaboratorsPageComponent },
      { path: 'colaboradores/postular', component: BuyerCollaboratorApplyPageComponent },
      { path: 'menu', component: BuyerCatalogMenuPageComponent },
      { path: 'colaborador/:id/menu', component: BuyerCollaboratorMenuPageComponent },
      { path: 'carrito', component: BuyerCartPageComponent },
      { path: 'checkout/datos', component: BuyerCheckoutDatosPageComponent },
      { path: 'checkout/pago', component: BuyerCheckoutPagoPageComponent },
      { path: 'pedidos', component: BuyerOrdersPageComponent },
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuyerRoutingModule {}
