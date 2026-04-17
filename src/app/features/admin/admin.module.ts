import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { API_BASE_URL } from '../../core/config/api-base-url.token';
import { AdminProductRepositoryPort } from '../../core/domain/admin-product/admin-product.repository.port';
import { AdminProductApiRepository } from '../../core/infrastructure/admin-products/admin-product-api.repository';
import { AdminOrderRepositoryPort } from '../../core/domain/admin-order/admin-order.repository.port';
import { AdminOrderApiRepository } from '../../core/infrastructure/admin-orders/admin-order-api.repository';
import { GetAllAdminProductsUseCase } from '../../core/application/admin-products/get-all-admin-products.use-case';
import { GetAllAdminOrdersUseCase } from '../../core/application/admin-orders/get-all-admin-orders.use-case';
import { UpdateAdminOrderStatusUseCase } from '../../core/application/admin-orders/update-admin-order-status.use-case';
import { AdminChatPanelModule } from './admin-chat-panel.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminProductsPageComponent } from './pages/products/admin-products-page.component';
import { AdminGlobalSalesPageComponent } from './pages/global-sales/admin-global-sales-page.component';
import { AdminFutureUpdatesPageComponent } from './pages/future-updates/admin-future-updates-page.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminPostulacionesSlideboxComponent } from './components/admin-postulaciones-slidebox/admin-postulaciones-slidebox.component';
import { AdminPostulacionesPageComponent } from './pages/postulaciones/admin-postulaciones-page.component';
import { AdminLayoutComponent } from './layout/admin-layout.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminProductsPageComponent,
    AdminGlobalSalesPageComponent,
    AdminPostulacionesPageComponent,
    AdminFutureUpdatesPageComponent,
    AdminPostulacionesSlideboxComponent,
    AdminSidebarComponent,
  ],
  imports: [CommonModule, SharedModule, AdminChatPanelModule, AdminRoutingModule],
  providers: [
    {
      provide: AdminProductRepositoryPort,
      useFactory: (http: HttpClient, api: string) => new AdminProductApiRepository(http, api),
      deps: [HttpClient, API_BASE_URL],
    },
    {
      provide: AdminOrderRepositoryPort,
      useFactory: (http: HttpClient, api: string) => new AdminOrderApiRepository(http, api),
      deps: [HttpClient, API_BASE_URL],
    },
    GetAllAdminProductsUseCase,
    GetAllAdminOrdersUseCase,
    UpdateAdminOrderStatusUseCase,
  ],
})
export class AdminModule {}
