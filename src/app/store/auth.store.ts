import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User, LoginRequest, UpdateProfileDto } from '../models';
import { computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => user() !== null),
    userRole: computed(() => user()?.role || null),
    isAdmin: computed(() => user()?.role === 'ADMIN'),
    isTechnician: computed(() => user()?.role === 'TECHNICIAN'),
    isReporter: computed(() => user()?.role === 'REPORTER'),
  })),
  withMethods((store, authService = inject(AuthService), router = inject(Router)) => {
    // Initialize state from auth service which checks local/session storage
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      patchState(store, { user: storedUser });
    }

    return {
      login: rxMethod<LoginRequest>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((credentials) => authService.login(credentials).pipe(
            tap((response) => {
              patchState(store, { user: response.user, isLoading: false, error: null });
              const redirectRoute = authService.getRedirectRouteForRole(response.user.role);
              router.navigate([redirectRoute]);
            }),
            catchError((error: Error | HttpErrorResponse) => {
              patchState(store, { isLoading: false, error: error.message });
              return of(null);
            })
          ))
        )
      ),

      logout: () => {
        authService.logout();
        patchState(store, { user: null, error: null });
      },

      updateProfile: rxMethod<UpdateProfileDto>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((dto) => authService.updateProfile(dto).pipe(
            tap((updatedUser) => patchState(store, { user: updatedUser, isLoading: false, error: null })),
            catchError((error: Error) => {
              patchState(store, { isLoading: false, error: error.message });
              return of(null);
            })
          ))
        )
      ),
      
      clearError: () => patchState(store, { error: null })
    };
  })
);
