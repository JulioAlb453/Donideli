import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { BuyerCollaboratorsPageComponent } from './features/buyer/pages/collaborators/buyer-collaborators-page.component';
import { BuyerCollaboratorMenuPageComponent } from './features/buyer/pages/collaborator-menu/buyer-collaborator-menu-page.component';
import { BuyerCartPageComponent } from './features/buyer/pages/cart/buyer-cart-page.component';
import { BuyerCheckoutDatosPageComponent } from './features/buyer/pages/checkout/buyer-checkout-datos-page.component';
import { BuyerCheckoutPagoPageComponent } from './features/buyer/pages/checkout/buyer-checkout-pago-page.component';
import { AdminProductsPageComponent } from './features/admin/pages/products/admin-products-page.component';
import { AdminGlobalSalesPageComponent } from './features/admin/pages/global-sales/admin-global-sales-page.component';
import { AdminFutureUpdatesPageComponent } from './features/admin/pages/future-updates/admin-future-updates-page.component';
import { LoginPageComponent } from './features/auth/pages/login/login-page.component';
import {
  adminRoleGuard,
  buyerRoleGuard,
} from './core/presentation/guards/auth-role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPageComponent },
  { path: 'buyer/inicio', component: HomeComponent, canActivate: [buyerRoleGuard] },
  {
    path: 'buyer/colaboradores',
    component: BuyerCollaboratorsPageComponent,
    canActivate: [buyerRoleGuard],
  },
  {
    path: 'buyer/colaborador/:id/menu',
    component: BuyerCollaboratorMenuPageComponent,
    canActivate: [buyerRoleGuard],
  },
  {
    path: 'buyer/carrito',
    component: BuyerCartPageComponent,
    canActivate: [buyerRoleGuard],
  },
  {
    path: 'buyer/checkout/datos',
    component: BuyerCheckoutDatosPageComponent,
    canActivate: [buyerRoleGuard],
  },
  {
    path: 'buyer/checkout/pago',
    component: BuyerCheckoutPagoPageComponent,
    canActivate: [buyerRoleGuard],
  },
  {
    path: 'admin/productos',
    component: AdminProductsPageComponent,
    canActivate: [adminRoleGuard],
  },
  {
    path: 'admin/ventas-globales',
    component: AdminGlobalSalesPageComponent,
    canActivate: [adminRoleGuard],
  },
  {
    path: 'admin/proximas-actualizaciones/postulantes',
    component: AdminFutureUpdatesPageComponent,
    canActivate: [adminRoleGuard],
    data: { futureArea: 'postulantes' },
  },
  {
    path: 'admin/proximas-actualizaciones/colaboradores',
    component: AdminFutureUpdatesPageComponent,
    canActivate: [adminRoleGuard],
    data: { futureArea: 'colaboradores' },
  },
  {
    path: 'admin/proximas-actualizaciones',
    component: AdminFutureUpdatesPageComponent,
    canActivate: [adminRoleGuard],
    data: { futureArea: 'general' },
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
