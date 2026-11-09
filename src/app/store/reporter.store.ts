import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, forkJoin } from 'rxjs';
import { ReporterService } from '../services/reporter.service';
import {
  Reporter,
  ReporterStatus,
  ReporterStats,
  ReporterDetail,
  CreateReporterRequest,
  UpdateReporterRequest,
  ReporterQueryParameters
} from '../models';

export interface ReporterState {
  reporters: Reporter[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  searchQuery: string;
  statusFilter: string;
  sortBy: string;
  sortDescending: boolean;
  stats: ReporterStats | null;
  selectedReporter: ReporterDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: ReporterState = {
  reporters: [],
  totalCount: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
  searchQuery: '',
  statusFilter: 'ALL',
  sortBy: 'createdAt',
  sortDescending: true,
  stats: null,
  selectedReporter: null,
  isLoading: false,
  isSaving: false,
  error: null
};

export const ReporterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ stats, totalCount, reporters }) => ({
    totalReporters: computed(() => stats()?.totalReporters ?? totalCount()),
    activeReporters: computed(() => stats()?.activeReporters ?? reporters().filter(r => r.status === 'ACTIVE').length),
    suspendedReporters: computed(() => stats()?.suspendedReporters ?? reporters().filter(r => r.status === 'SUSPENDED').length),
    deactivatedReporters: computed(() => stats()?.deactivatedReporters ?? reporters().filter(r => r.status === 'DEACTIVATED').length),
  })),
  withMethods((store, reporterService = inject(ReporterService)) => {
    const fetchReportersInternal = (customParams?: Partial<ReporterQueryParameters>) => {
      const search = customParams?.search !== undefined ? customParams.search : store.searchQuery();
      const status = customParams?.status !== undefined ? customParams.status : store.statusFilter();
      const sortBy = customParams?.sortBy !== undefined ? customParams.sortBy : store.sortBy();
      const sortDescending = customParams?.sortDescending !== undefined ? customParams.sortDescending : store.sortDescending();
      const page = customParams?.page !== undefined ? customParams.page : store.page();
      const pageSize = customParams?.pageSize !== undefined ? customParams.pageSize : store.pageSize();

      patchState(store, {
        isLoading: true,
        error: null,
        searchQuery: search,
        statusFilter: status,
        sortBy,
        sortDescending,
        page,
        pageSize
      });

      return forkJoin({
        paginated: reporterService.getReporters({
          search,
          status,
          sortBy,
          sortDescending,
          page,
          pageSize
        }),
        stats: reporterService.getReporterStats()
      }).pipe(
        tap(({ paginated, stats }) => {
          patchState(store, {
            reporters: paginated.items || [],
            totalCount: paginated.totalCount,
            page: paginated.page,
            pageSize: paginated.pageSize,
            totalPages: paginated.totalPages,
            stats,
            isLoading: false
          });
        }),
        catchError((err) => {
          patchState(store, { isLoading: false, error: 'Failed to load reporters.' });
          return of(null);
        })
      );
    };

    return {
      loadReporters: rxMethod<Partial<ReporterQueryParameters> | void>(
        pipe(
          switchMap((params) => fetchReportersInternal(params || {}))
        )
      ),

      loadStats: rxMethod<void>(
        pipe(
          switchMap(() => reporterService.getReporterStats().pipe(
            tap((stats) => patchState(store, { stats })),
            catchError(() => of(null))
          ))
        )
      ),

      loadReporterById: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) => reporterService.getReporterById(id).pipe(
            tap((detail) => patchState(store, { selectedReporter: detail, isLoading: false })),
            catchError((err) => {
              patchState(store, { isLoading: false, error: 'Failed to load reporter details.' });
              return of(null);
            })
          ))
        )
      ),

      setSearch: (search: string) => {
        fetchReportersInternal({ search, page: 1 }).subscribe();
      },

      setStatusFilter: (status: string) => {
        fetchReportersInternal({ status, page: 1 }).subscribe();
      },

      setSorting: (sortBy: string) => {
        const isSame = store.sortBy() === sortBy;
        const sortDescending = isSame ? !store.sortDescending() : true;
        fetchReportersInternal({ sortBy, sortDescending, page: 1 }).subscribe();
      },

      setPage: (page: number) => {
        fetchReportersInternal({ page }).subscribe();
      },

      setPageSize: (pageSize: number) => {
        fetchReportersInternal({ pageSize, page: 1 }).subscribe();
      },

      toggleReporterStatus: rxMethod<{ id: string, newStatus: ReporterStatus }>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null })),
          switchMap(({ id, newStatus }) => reporterService.updateStatus(id, newStatus).pipe(
            tap((updated) => {
              const updatedList = store.reporters().map(r => r.id === id ? { ...r, status: updated.status, isActive: updated.isActive } : r);
              patchState(store, { reporters: updatedList, isSaving: false });
              // Refresh stats
              reporterService.getReporterStats().subscribe(stats => patchState(store, { stats }));
            }),
            catchError((err) => {
              patchState(store, { isSaving: false, error: 'Failed to update reporter status.' });
              return of(null);
            })
          ))
        )
      ),

      clearSelectedReporter: () => {
        patchState(store, { selectedReporter: null });
      }
    };
  })
);
