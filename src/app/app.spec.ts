import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { App } from './app';
import { routes } from './app-routing-module';
import { AuthSessionService } from './core/application/auth/auth-session.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot(routes)],
      declarations: [App],
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
