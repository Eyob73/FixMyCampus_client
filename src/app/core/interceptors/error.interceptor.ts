import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, catchError, switchMap, take, throwError, finalize, shareReplay } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationStore } from '../../store/notification.store';

let refreshObservable: Observable<string> | null = null;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationStore = inject(NotificationStore);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // 1. If 401 occurs on login or register, do not attempt token refresh
      if (err.status === 401 && (req.url.toLowerCase().includes('/auth/login') || req.url.toLowerCase().includes('/auth/register'))) {
        return throwError(() => err);
      }

      // 2. If 401 occurs on the refresh endpoint itself, the refresh token has expired or is invalid
      if (err.status === 401 && req.url.toLowerCase().includes('/auth/refresh')) {
        authService.removeTokens();
        authService.logout(false);
        notificationStore.showToast({
          type: 'warning',
          title: 'Session Expired',
          message: 'Your session has expired. Please sign in again.'
        });
        const currentUrl = router.url;
        if (currentUrl && !currentUrl.includes('/login')) {
          router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
        } else {
          router.navigate(['/login']);
        }
        return throwError(() => err);
      }

      // 3. Concurrency-safe token renewal: all concurrent 401s share the same in-flight refresh observable
      if (err.status === 401) {
        if (!refreshObservable) {
          refreshObservable = authService.refresh().pipe(
            switchMap((res: any) => {
              const newToken = res.accessToken || res.token;
              if (!newToken) {
                return throwError(() => new Error('No access token received from refresh'));
              }
              return of(newToken);
            }),
            catchError((refreshErr) => {
              authService.removeTokens();
              authService.logout(false);
              notificationStore.showToast({
                type: 'warning',
                title: 'Session Expired',
                message: 'Your session has expired. Please sign in again.'
              });
              const currentUrl = router.url;
              if (currentUrl && !currentUrl.includes('/login')) {
                router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
              } else {
                router.navigate(['/login']);
              }
              return throwError(() => refreshErr);
            }),
            finalize(() => {
              refreshObservable = null;
            }),
            shareReplay({ bufferSize: 1, refCount: false })
          );
        }

        return refreshObservable.pipe(
          take(1),
          switchMap((newToken) => {
            return next(req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
                'X-Refresh-Retry': 'true'
              }
            }));
          })
        );
      }

      // 4. Handle all other non-401 HTTP errors
      if (err.status !== 404 && err.status !== 0 && !req.url.includes('/auth/login')) {
        const errorMsg = err.error?.message || err.error?.detail || err.statusText || 'An unexpected server error occurred';
        notificationStore.showToast({ type: 'error', title: 'Network Error', message: errorMsg });
      }

      return throwError(() => err);
    })
  );
};
