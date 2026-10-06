import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { TechnicianService } from '../services/technician.service';
import { Technician, CreateTechnicianDto, UpdateTechnicianDto } from '../models';
import { computed } from '@angular/core';

export interface TechnicianState {
  technicians: Technician[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TechnicianState = {
  technicians: [],
  isLoading: false,
  error: null
};

export const TechnicianStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ technicians }) => ({
    totalTechnicians: computed(() => technicians().length),
    availableTechnicians: computed(() => technicians().filter(t => t.status === 'AVAILABLE').length),
    busyTechnicians: computed(() => technicians().filter(t => t.status === 'BUSY').length),
  })),
  withMethods((store, technicianService = inject(TechnicianService)) => {
    return {
      loadTechnicians: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => technicianService.getTechnicians().pipe(
            tap((technicians) => {
              if (technicians && technicians.length) {
                patchState(store, { technicians, isLoading: false });
              }
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to load technicians' });
              return of(null);
            })
          ))
        )
      ),

      createTechnician: rxMethod<CreateTechnicianDto>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((dto) => technicianService.createTechnician(dto).pipe(
            tap((newTech) => {
              const updated = [newTech, ...store.technicians()];
              patchState(store, { technicians: updated, isLoading: false });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to create technician' });
              return of(null);
            })
          ))
        )
      ),

      updateTechnician: rxMethod<UpdateTechnicianDto>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((dto) => technicianService.updateTechnician(dto).pipe(
            tap((updatedTech) => {
              const updated = store.technicians().map(t => t.id === dto.id ? { ...t, ...dto } : t);
              patchState(store, { technicians: updated, isLoading: false });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to update technician' });
              return of(null);
            })
          ))
        )
      ),

      deleteTechnician: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) => technicianService.deleteTechnician(id).pipe(
            tap(() => {
              const updated = store.technicians().filter(t => t.id !== id);
              patchState(store, { technicians: updated, isLoading: false });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to delete technician' });
              return of(null);
            })
          ))
        )
      )
    };
  })
);
