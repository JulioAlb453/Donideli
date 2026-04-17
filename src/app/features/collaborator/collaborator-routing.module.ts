import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CollaboratorLayoutComponent } from './layout/collaborator-layout.component';
import { CollaboratorProductsPageComponent } from './pages/products/collaborator-products-page.component';

const routes: Routes = [
  {
    path: '',
    component: CollaboratorLayoutComponent,
    children: [
      { path: 'productos', component: CollaboratorProductsPageComponent },
      { path: '', pathMatch: 'full', redirectTo: 'productos' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollaboratorRoutingModule {}
