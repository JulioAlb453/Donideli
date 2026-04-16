import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AdminProductRepositoryPort } from '../../core/domain/admin-product/admin-product.repository.port';
import { AdminProductInMemoryRepository } from '../../core/infrastructure/admin-products/admin-product-in-memory.repository';
import { AdminOrderRepositoryPort } from '../../core/domain/admin-order/admin-order.repository.port';
import { AdminOrderInMemoryRepository } from '../../core/infrastructure/admin-orders/admin-order-in-memory.repository';
import { GetAllAdminProductsUseCase } from '../../core/application/admin-products/get-all-admin-products.use-case';
import { GetAllAdminOrdersUseCase } from '../../core/application/admin-orders/get-all-admin-orders.use-case';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminProductsPageComponent } from './pages/products/admin-products-page.component';
import { AdminGlobalSalesPageComponent } from './pages/global-sales/admin-global-sales-page.component';
import { AdminFutureUpdatesPageComponent } from './pages/future-updates/admin-future-updates-page.component';

@NgModule({
  declarations: [
    AdminProductsPageComponent,
    AdminGlobalSalesPageComponent,
    AdminFutureUpdatesPageComponent,
  ],
  imports: [CommonModule, SharedModule, AdminRoutingModule],
  providers: [
    {
      provide: AdminProductRepositoryPort,
      useClass: AdminProductInMemoryRepository,
    },
    {
      provide: AdminOrderRepositoryPort,
      useClass: AdminOrderInMemoryRepository,
    },
    GetAllAdminProductsUseCase,
    GetAllAdminOrdersUseCase,
  ],
})
export class AdminModule {}
