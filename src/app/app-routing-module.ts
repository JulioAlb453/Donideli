import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  adminRoleGuard,
  buyerRoleGuard,
} from './core/presentation/guards/auth-role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'buyer',
    loadChildren: () =>
      import('./features/buyer/buyer.module').then((m) => m.BuyerModule),
    canActivate: [buyerRoleGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then((m) => m.AdminModule),
    canActivate: [adminRoleGuard],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
