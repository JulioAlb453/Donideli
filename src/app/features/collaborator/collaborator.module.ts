import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { API_BASE_URL } from '../../core/config/api-base-url.token';
import { AdminProductRepositoryPort } from '../../core/domain/admin-product/admin-product.repository.port';
import { CollaboratorProductApiRepository } from '../../core/infrastructure/collaborator-products/collaborator-product-api.repository';
import { GetAllAdminProductsUseCase } from '../../core/application/admin-products/get-all-admin-products.use-case';
import { AdminChatPanelModule } from '../admin/admin-chat-panel.module';
import { CollaboratorRoutingModule } from './collaborator-routing.module';
import { CollaboratorLayoutComponent } from './layout/collaborator-layout.component';
import { CollaboratorSidebarComponent } from './components/collaborator-sidebar/collaborator-sidebar.component';
import { CollaboratorProductsPageComponent } from './pages/products/collaborator-products-page.component';

@NgModule({
  declarations: [
    CollaboratorLayoutComponent,
    CollaboratorSidebarComponent,
    CollaboratorProductsPageComponent,
  ],
  imports: [CommonModule, RouterModule, SharedModule, AdminChatPanelModule, CollaboratorRoutingModule],
  providers: [
    {
      provide: AdminProductRepositoryPort,
      useFactory: (http: HttpClient, api: string) => new CollaboratorProductApiRepository(http, api),
      deps: [HttpClient, API_BASE_URL],
    },
    GetAllAdminProductsUseCase,
  ],
})
export class CollaboratorModule {}
