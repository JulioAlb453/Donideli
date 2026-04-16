import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { App } from './app';
import { routes } from './app-routing-module';
import { CollaboratorRepositoryPort } from './core/domain/collaborator/collaborator.repository.port';
import { CollaboratorInMemoryRepository } from './core/infrastructure/collaborators/collaborator-in-memory.repository';
import { HomeComponent } from './features/home/home.component';
import { BuyerNavbarComponent } from './features/buyer/components/buyer-navbar/buyer-navbar.component';
import { CollaboratorCardComponent } from './features/buyer/components/collaborator-card/collaborator-card.component';
import { BuyerCollaboratorsPageComponent } from './features/buyer/pages/collaborators/buyer-collaborators-page.component';
import { BuyerCollaboratorMenuPageComponent } from './features/buyer/pages/collaborator-menu/buyer-collaborator-menu-page.component';
import { BuyerCartPageComponent } from './features/buyer/pages/cart/buyer-cart-page.component';
import { BuyerCheckoutDatosPageComponent } from './features/buyer/pages/checkout/buyer-checkout-datos-page.component';
import { BuyerCheckoutPagoPageComponent } from './features/buyer/pages/checkout/buyer-checkout-pago-page.component';
import { AdminProductsPageComponent } from './features/admin/pages/products/admin-products-page.component';
import { AdminGlobalSalesPageComponent } from './features/admin/pages/global-sales/admin-global-sales-page.component';
import { AdminFutureUpdatesPageComponent } from './features/admin/pages/future-updates/admin-future-updates-page.component';
import { LoginPageComponent } from './features/auth/pages/login/login-page.component';
import { AdminProductRepositoryPort } from './core/domain/admin-product/admin-product.repository.port';
import { AdminProductInMemoryRepository } from './core/infrastructure/admin-products/admin-product-in-memory.repository';
import { AdminOrderRepositoryPort } from './core/domain/admin-order/admin-order.repository.port';
import { AdminOrderInMemoryRepository } from './core/infrastructure/admin-orders/admin-order-in-memory.repository';
import { AuthSessionService } from './core/application/auth/auth-session.service';
import { FlaticonIconComponent } from './shared/ui/flaticon-icon/flaticon-icon.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot(routes)],
      declarations: [
        App,
        HomeComponent,
        FlaticonIconComponent,
        BuyerNavbarComponent,
        CollaboratorCardComponent,
        BuyerCollaboratorsPageComponent,
        BuyerCollaboratorMenuPageComponent,
        BuyerCartPageComponent,
        BuyerCheckoutDatosPageComponent,
        BuyerCheckoutPagoPageComponent,
        AdminProductsPageComponent,
        AdminGlobalSalesPageComponent,
        AdminFutureUpdatesPageComponent,
        LoginPageComponent,
      ],
      providers: [
        {
          provide: CollaboratorRepositoryPort,
          useClass: CollaboratorInMemoryRepository,
        },
        {
          provide: AdminProductRepositoryPort,
          useClass: AdminProductInMemoryRepository,
        },
        {
          provide: AdminOrderRepositoryPort,
          useClass: AdminOrderInMemoryRepository,
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render marca en el hero para comprador autenticado', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const auth = TestBed.inject(AuthSessionService);

    auth.hydrateForTests({
      email: 'comprador@donideli.com',
      displayName: 'Comprador DoniDeli',
      role: 'buyer',
    });

    await router.navigateByUrl('/buyer/inicio');
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent?.trim()).toContain('DoniDeli');
  });
});
