import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { BuildingService } from '../services/building.service';
import { Building, CreateBuildingDto } from '../models';
import { computed } from '@angular/core';

export interface BuildingState {
  buildings: Building[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BuildingState = {
  buildings: [],
  isLoading: false,
  error: null
};

export const BuildingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ buildings }) => ({
    totalBuildings: computed(() => buildings().length),
    operationalBuildings: computed(() => buildings().filter(b => b.status === 'OPERATIONAL').length),
    maintenanceBuildings: computed(() => buildings().filter(b => b.status === 'MAINTENANCE_SURGE').length),
  })),
  withMethods((store, buildingService = inject(BuildingService)) => {
    return {
      loadBuildings: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => buildingService.getBuildings().pipe(
            tap((buildings) => {
              if (buildings && buildings.length) {
                patchState(store, { buildings, isLoading: false });
              }
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to load buildings' });
              return of(null);
            })
          ))
        )
      ),

      createBuilding: rxMethod<CreateBuildingDto>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((dto) => buildingService.createBuilding(dto).pipe(
            tap((newBuilding) => {
              const updated = [newBuilding, ...store.buildings()];
              patchState(store, { buildings: updated, isLoading: false });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to create building' });
              return of(null);
            })
          ))
        )
      ),

      updateBuilding: rxMethod<{ id: string, partial: Partial<Building> }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ id, partial }) => buildingService.updateBuilding(id, partial).pipe(
            tap((updatedBuilding) => {
              const updated = store.buildings().map(b => b.id === id ? { ...b, ...partial } : b);
              patchState(store, { buildings: updated, isLoading: false });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to update building' });
              return of(null);
            })
          ))
        )
      ),

      deleteBuilding: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) => buildingService.deleteBuilding(id).pipe(
            tap(() => {
              const updated = store.buildings().filter(b => b.id !== id);
              patchState(store, { buildings: updated, isLoading: false });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to delete building' });
              return of(null);
            })
          ))
        )
      )
    };
  })
);
