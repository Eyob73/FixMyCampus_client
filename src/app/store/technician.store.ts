import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, forkJoin } from 'rxjs';
import { TechnicianService } from '../services/technician.service';
import {
  Technician,
  TechnicianStatus,
  TechnicianStats,
  TechnicianDetail,
  CreateTechnicianDto,
  UpdateTechnicianDto,
  TechnicianQueryParameters
} from '../models';

export interface TechnicianState {
  technicians: Technician[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  searchQuery: string;
  statusFilter: string;
  departmentFilter: string;
  sortBy: string;
  sortDescending: boolean;
  stats: TechnicianStats | null;
  selectedTechnician: TechnicianDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: TechnicianState = {
  technicians: [],
  totalCount: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
  searchQuery: '',
  statusFilter: 'ALL',
  departmentFilter: 'ALL',
  sortBy: 'createdAt',
  sortDescending: true,
  stats: null,
  selectedTechnician: null,
  isLoading: false,
  isSaving: false,
  error: null
};

export const TechnicianStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ stats, totalCount, technicians }) => ({
    totalTechnicians: computed(() => stats()?.totalTechnicians ?? totalCount() ?? technicians().length),
    availableTechnicians: computed(() => stats()?.availableTechnicians ?? technicians().filter(t => t.status === 'AVAILABLE').length),
    busyTechnicians: computed(() => stats()?.busyTechnicians ?? technicians().filter(t => t.status === 'BUSY').length),
    onCallTechnicians: computed(() => stats()?.onCallTechnicians ?? technicians().filter(t => t.status === 'ON_CALL').length),
    offDutyTechnicians: computed(() => stats()?.offDutyTechnicians ?? technicians().filter(t => t.status === 'OFF_DUTY').length),
  })),
  withMethods((store, technicianService = inject(TechnicianService)) => {
    const fetchTechniciansInternal = (customParams?: Partial<TechnicianQueryParameters>) => {
      const search = customParams?.search !== undefined ? customParams.search : store.searchQuery();
      const status = customParams?.status !== undefined ? customParams.status : store.statusFilter();
      const department = customParams?.department !== undefined ? customParams.department : store.departmentFilter();
      const sortBy = customParams?.sortBy !== undefined ? customParams.sortBy : store.sortBy();
      const sortDescending = customParams?.sortDescending !== undefined ? customParams.sortDescending : store.sortDescending();
      const page = customParams?.page !== undefined ? customParams.page : store.page();
      const pageSize = customParams?.pageSize !== undefined ? customParams.pageSize : store.pageSize();

      patchState(store, {
        isLoading: true,
        error: null,
        searchQuery: search,
        statusFilter: status,
        departmentFilter: department,
        sortBy,
        sortDescending,
        page,
        pageSize
      });

      return forkJoin({
        paginated: technicianService.getTechniciansPaginated({
          search,
          status,
          department,
          sortBy,
          sortDescending,
          page,
          pageSize
        }),
        stats: technicianService.getTechnicianStats().pipe(
          catchError((err) => {
            console.warn('Could not load technician stats:', err);
            return of(null);
          })
        )
      }).pipe(
        tap(({ paginated, stats }) => {
          const items: Technician[] = Array.isArray(paginated)
            ? (paginated as any)
            : (paginated?.items || []);
          const total = Array.isArray(paginated)
            ? (paginated as any).length
            : (paginated?.totalCount ?? items.length);
          const pageNum = Array.isArray(paginated) ? 1 : (paginated?.page ?? 1);
          const pageSizeNum = Array.isArray(paginated) ? items.length : (paginated?.pageSize ?? 10);
          const totalP = Array.isArray(paginated)
            ? 1
            : (paginated?.totalPages ?? Math.ceil(total / (pageSizeNum || 1)));

          patchState(store, {
            technicians: items,
            totalCount: total,
            page: pageNum,
            pageSize: pageSizeNum,
            totalPages: totalP,
            stats,
            isLoading: false
          });
        }),
        catchError((err) => {
          console.error('Failed to load technicians:', err);
          patchState(store, { isLoading: false, error: 'Failed to load technicians.' });
          return of(null);
        })
      );
    };

    return {
      loadTechnicians: rxMethod<Partial<TechnicianQueryParameters> | void>(
        pipe(
          switchMap((params) => fetchTechniciansInternal(params || {}))
        )
      ),

      loadStats: rxMethod<void>(
        pipe(
          switchMap(() => technicianService.getTechnicianStats().pipe(
            tap((stats) => patchState(store, { stats })),
            catchError(() => of(null))
          ))
        )
      ),

      loadTechnicianById: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) => technicianService.getTechnicianById(id).pipe(
            tap((detail) => patchState(store, { selectedTechnician: detail, isLoading: false })),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to load technician details.' });
              return of(null);
            })
          ))
        )
      ),

      setSearch: (search: string) => {
        fetchTechniciansInternal({ search, page: 1 }).subscribe();
      },

      setStatusFilter: (status: string) => {
        fetchTechniciansInternal({ status, page: 1 }).subscribe();
      },

      setDepartmentFilter: (department: string) => {
        fetchTechniciansInternal({ department, page: 1 }).subscribe();
      },

      setSorting: (sortBy: string) => {
        const isSame = store.sortBy() === sortBy;
        const sortDescending = isSame ? !store.sortDescending() : true;
        fetchTechniciansInternal({ sortBy, sortDescending, page: 1 }).subscribe();
      },

      setPage: (page: number) => {
        fetchTechniciansInternal({ page }).subscribe();
      },

      setPageSize: (pageSize: number) => {
        fetchTechniciansInternal({ pageSize, page: 1 }).subscribe();
      },

      toggleTechnicianStatus: rxMethod<{ id: string, newStatus: string }>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null })),
          switchMap(({ id, newStatus }) => technicianService.updateTechnicianStatus(id, newStatus).pipe(
            tap((updated) => {
              const updatedList = store.technicians().map(t => t.id === id ? { ...t, status: updated.status as TechnicianStatus } : t);
              patchState(store, { technicians: updatedList, isSaving: false });
              technicianService.getTechnicianStats().subscribe(stats => patchState(store, { stats }));
            }),
            catchError((err) => {
              patchState(store, { isSaving: false, error: 'Failed to update technician status.' });
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
              fetchTechniciansInternal().subscribe();
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to delete technician' });
              return of(null);
            })
          ))
        )
      ),

      clearSelectedTechnician: () => {
        patchState(store, { selectedTechnician: null });
      }
    };
  })
);
