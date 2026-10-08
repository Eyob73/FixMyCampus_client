import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationStore } from '../../store/notification.store';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationStore = inject(NotificationStore);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 Unauthorized occurs on an authenticated route (not login endpoint itself), log out
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        authService.logout();
        notificationStore.showToast({ type: 'warning', title: 'Session Expired', message: 'Your session has expired. Please sign in again.' });
      } else if (error.status !== 404 && error.status !== 0 && !req.url.includes('/auth/login')) {
        const errorMsg = error.error?.message || error.statusText || 'An unexpected server error occurred';
        notificationStore.showToast({ type: 'error', title: 'Network Error', message: errorMsg });
      }
      return throwError(() => error);
    })
  );
};
