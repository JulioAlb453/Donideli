import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { BuyerCollaboratorsPageComponent } from './features/buyer/pages/collaborators/buyer-collaborators-page.component';
import { BuyerCollaboratorMenuPageComponent } from './features/buyer/pages/collaborator-menu/buyer-collaborator-menu-page.component';
import { AdminProductsPageComponent } from './features/admin/pages/products/admin-products-page.component';
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
    path: 'admin/productos',
    component: AdminProductsPageComponent,
    canActivate: [adminRoleGuard],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
