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
      ],
      providers: [
        {
          provide: CollaboratorRepositoryPort,
          useClass: CollaboratorInMemoryRepository,
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render marca en el hero', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent?.trim()).toContain('DoniDeli');
  });
});
