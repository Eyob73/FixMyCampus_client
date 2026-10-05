import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 Unauthorized occurs on an authenticated route (not login endpoint itself), log out
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        authService.logout();
        notificationService.warning('Session Expired', 'Your session has expired. Please sign in again.');
      } else if (error.status !== 404 && error.status !== 0 && !req.url.includes('/auth/login')) {
        const errorMsg = error.error?.message || error.statusText || 'An unexpected server error occurred';
        notificationService.error('Network Error', errorMsg);
      }
      return throwError(() => error);
    })
  );
};
