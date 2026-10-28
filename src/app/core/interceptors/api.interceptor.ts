import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const setHeaders: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest'
  };

  if (token && !req.headers.has('Authorization')) {
    setHeaders['Authorization'] = `Bearer ${token}`;
  }

  const authReq = req.clone({
    setHeaders,
    withCredentials: true
  });

  return next(authReq);
};
