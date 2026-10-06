import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationStore } from '../../store/notification.store';

export const technicianGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationStore = inject(NotificationStore);

  if (authService.isTechnician()) {
    return true;
  }

  notificationStore.showToast({
    type: 'error',
    message: 'Access restricted to authenticated maintenance technicians.'
  });
  router.navigate(['/']);
  return false;
};
