import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { BuyerCollaboratorsPageComponent } from './features/buyer/pages/collaborators/buyer-collaborators-page.component';
import { BuyerCollaboratorMenuPageComponent } from './features/buyer/pages/collaborator-menu/buyer-collaborator-menu-page.component';
import { AdminProductsPageComponent } from './features/admin/pages/products/admin-products-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'buyer/colaboradores', component: BuyerCollaboratorsPageComponent },
  {
    path: 'buyer/colaborador/:id/menu',
    component: BuyerCollaboratorMenuPageComponent,
  },
  { path: 'admin/productos', component: AdminProductsPageComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
