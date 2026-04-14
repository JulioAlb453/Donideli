import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../../application/auth/auth-session.service';

export const buyerRoleGuard: CanActivateFn = () => {
  const auth = inject(AuthSessionService);
  const router = inject(Router);

  if (auth.hasRole('buyer')) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const adminRoleGuard: CanActivateFn = () => {
  const auth = inject(AuthSessionService);
  const router = inject(Router);

  if (auth.hasRole('admin')) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
