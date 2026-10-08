import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    if (authService.isAdmin()) {
      return true;
    }
    const role = authService.getUserRole();
    if (role) {
      router.navigate([authService.getRedirectRouteForRole(role)]);
      return false;
    }
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
