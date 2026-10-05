import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
<<<<<<< HEAD
import { provideHttpClient } from '@angular/common/http';
=======
import { provideHttpClient, withInterceptors } from '@angular/common/http';
>>>>>>> technician
import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
<<<<<<< HEAD
    provideHttpClient()
  ]
=======
    provideHttpClient(withInterceptors([apiInterceptor])),
  ],
>>>>>>> technician
};

