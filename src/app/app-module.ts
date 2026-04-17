import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { API_BASE_URL } from './core/config/api-base-url.token';
import { CollaboratorRepositoryPort } from './core/domain/collaborator/collaborator.repository.port';
import { authApiInterceptor } from './core/infrastructure/api/auth-api.interceptor';
import { collaboratorRepositoryFactory } from './core/infrastructure/collaborators/collaborator-repository.factory';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authApiInterceptor])),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    {
      provide: CollaboratorRepositoryPort,
      useFactory: collaboratorRepositoryFactory,
      deps: [HttpClient, API_BASE_URL],
    },
  ],
  bootstrap: [App],
})
export class AppModule {}
