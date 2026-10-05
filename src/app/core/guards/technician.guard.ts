import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const technicianGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (authService.isTechnician()) {
    return true;
  }

  notificationService.error('Access restricted to authenticated maintenance technicians.', 'Unauthorized Access');
  router.navigate(['/']);
  return false;
};
