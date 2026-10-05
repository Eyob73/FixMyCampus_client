import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const role = authService.getUserRole();
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    if (role) {
      router.navigate([authService.getRedirectRouteForRole(role)]);
      return false;
    }

    router.navigate(['/login']);
    return false;
  };
};
