import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't show toast for 404 on initial sync, let services handle fallback
      if (error.status !== 404 && error.status !== 0) {
        const errorMsg = error.error?.message || error.statusText || 'An unexpected server error occurred';
        notificationService.error('Network Error', errorMsg);
      }
      return throwError(() => error);
    })
  );
};
