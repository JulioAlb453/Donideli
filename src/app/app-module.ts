import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { CollaboratorRepositoryPort } from './core/domain/collaborator/collaborator.repository.port';
import { CollaboratorInMemoryRepository } from './core/infrastructure/collaborators/collaborator-in-memory.repository';
import { HomeComponent } from './features/home/home.component';
import { BuyerNavbarComponent } from './features/buyer/components/buyer-navbar/buyer-navbar.component';
import { CollaboratorCardComponent } from './features/buyer/components/collaborator-card/collaborator-card.component';
import { BuyerCollaboratorsPageComponent } from './features/buyer/pages/collaborators/buyer-collaborators-page.component';
import { BuyerCollaboratorMenuPageComponent } from './features/buyer/pages/collaborator-menu/buyer-collaborator-menu-page.component';
import { AdminProductsPageComponent } from './features/admin/pages/products/admin-products-page.component';
import { AdminProductRepositoryPort } from './core/domain/admin-product/admin-product.repository.port';
import { AdminProductInMemoryRepository } from './core/infrastructure/admin-products/admin-product-in-memory.repository';
import { FlaticonIconComponent } from './shared/ui/flaticon-icon/flaticon-icon.component';

@NgModule({
  declarations: [
    App,
    HomeComponent,
    FlaticonIconComponent,
    BuyerNavbarComponent,
    CollaboratorCardComponent,
    BuyerCollaboratorsPageComponent,
    BuyerCollaboratorMenuPageComponent,
    AdminProductsPageComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    {
      provide: CollaboratorRepositoryPort,
      useClass: CollaboratorInMemoryRepository,
    },
    {
      provide: AdminProductRepositoryPort,
      useClass: AdminProductInMemoryRepository,
    },
  ],
  bootstrap: [App],
})
export class AppModule {}
