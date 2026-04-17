import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminProductsPageComponent } from './pages/products/admin-products-page.component';
import { AdminGlobalSalesPageComponent } from './pages/global-sales/admin-global-sales-page.component';
import { AdminFutureUpdatesPageComponent } from './pages/future-updates/admin-future-updates-page.component';
import { AdminPostulacionesPageComponent } from './pages/postulaciones/admin-postulaciones-page.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'productos', component: AdminProductsPageComponent },
      { path: 'postulaciones', component: AdminPostulacionesPageComponent },
      { path: 'ventas-globales', component: AdminGlobalSalesPageComponent },
      {
        path: 'proximas-actualizaciones/postulantes',
        component: AdminFutureUpdatesPageComponent,
        data: { futureArea: 'postulantes' },
      },
      {
        path: 'proximas-actualizaciones/colaboradores',
        component: AdminFutureUpdatesPageComponent,
        data: { futureArea: 'colaboradores' },
      },
      {
        path: 'proximas-actualizaciones',
        component: AdminFutureUpdatesPageComponent,
        data: { futureArea: 'general' },
      },
      { path: '', pathMatch: 'full', redirectTo: 'productos' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
