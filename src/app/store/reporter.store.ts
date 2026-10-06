import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { ReporterService } from '../services/reporter.service';
import { Reporter, ReporterStatus } from '../models';
import { computed } from '@angular/core';

export interface ReporterState {
  reporters: Reporter[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ReporterState = {
  reporters: [],
  isLoading: false,
  error: null
};

export const ReporterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ reporters }) => ({
    totalReporters: computed(() => reporters().length),
    activeReporters: computed(() => reporters().filter(r => r.status === 'ACTIVE').length),
  })),
  withMethods((store, reporterService = inject(ReporterService)) => {
    return {
      loadReporters: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => reporterService.getReporters().pipe(
            tap((reporters) => {
              if (reporters && reporters.length) {
                patchState(store, { reporters, isLoading: false });
              }
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to load reporters' });
              return of(null);
            })
          ))
        )
      ),

      toggleReporterStatus: rxMethod<{ id: string, newStatus: ReporterStatus }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ id, newStatus }) => reporterService.toggleStatus(id, newStatus).pipe(
            tap((updatedReporter) => {
              const updated = store.reporters().map(r => r.id === id ? { ...r, status: newStatus } : r);
              patchState(store, { reporters: updated, isLoading: false });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to toggle status' });
              return of(null);
            })
          ))
        )
      )
    };
  })
);
