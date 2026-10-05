import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
<<<<<<< HEAD
import { provideRouter, withComponentInputBinding } from '@angular/router';
<<<<<<< HEAD
import { provideHttpClient } from '@angular/common/http';
=======
import { provideHttpClient, withInterceptors } from '@angular/common/http';
>>>>>>> technician
import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';
=======
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor, errorInterceptor } from './interceptors';
>>>>>>> admin

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
<<<<<<< HEAD
    provideRouter(routes, withComponentInputBinding()),
<<<<<<< HEAD
    provideHttpClient()
=======
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
>>>>>>> admin
  ]
=======
    provideHttpClient(withInterceptors([apiInterceptor])),
  ],
>>>>>>> technician
};

