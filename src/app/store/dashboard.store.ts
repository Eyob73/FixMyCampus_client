import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { DashboardService } from '../services/dashboard.service';
import { TicketStore } from './ticket.store';
import { CategoryMetric, PriorityMetric, WeeklyVelocity, ReporterDashboardDto, AdminDashboardDto, TechnicianDashboardDto } from '../models/dashboard.model';

export interface DashboardState {
  reporterStats: ReporterDashboardDto | null;
  adminStats: AdminDashboardDto | null;
  technicianStats: TechnicianDashboardDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  reporterStats: null,
  adminStats: null,
  technicianStats: null,
  isLoading: false,
  error: null
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state, ticketStore = inject(TicketStore)) => {
    // Keep categoryMetrics and priorityMetrics for Admin dashboard
    const categoryMetrics = computed<CategoryMetric[]>(() => {
      const all = ticketStore.tickets();
      const counts: Record<string, number> = {};
      all.forEach((t) => {
        counts[t.category] = (counts[t.category] || 0) + 1;
      });

      const total = all.length || 1;
      return Object.entries(counts).map(([cat, count]) => ({
        category: cat as any,
        count,
        percentage: Math.round((count / total) * 100)
      }));
    });

    const priorityMetrics = computed<PriorityMetric[]>(() => {
      const all = ticketStore.tickets();
      const colors: Record<string, string> = {
        CRITICAL: '#ba1a1a',
        HIGH: '#d97706',
        MEDIUM: '#0284c7',
        LOW: '#10b981'
      };

      const counts: Record<string, number> = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0
      };

      all.forEach((t) => {
        if (counts[t.priority] !== undefined) {
          counts[t.priority]++;
        }
      });

      return (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => ({
        priority: p,
        count: counts[p],
        color: colors[p]
      }));
    });

    const weeklyVelocity = computed<WeeklyVelocity[]>(() => {
      const all = ticketStore.tickets();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      const velocity = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayName = days[d.getDay()];
        const startOfDay = new Date(d.setHours(0,0,0,0));
        const endOfDay = new Date(d.setHours(23,59,59,999));

        const created = all.filter(t => new Date(t.createdAt) >= startOfDay && new Date(t.createdAt) <= endOfDay).length;
        const resolved = all.filter(t => t.status === 'RESOLVED' && new Date(t.updatedAt) >= startOfDay && new Date(t.updatedAt) <= endOfDay).length;

        velocity.push({ day: dayName, created, resolved });
      }

      return velocity;
    });

    return {
      categoryMetrics,
      priorityMetrics,
      weeklyVelocity
    };
  }),
  withMethods((store, dashboardService = inject(DashboardService)) => ({
    loadReporterStats: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => dashboardService.getReporterStats().pipe(
          tap((stats) => patchState(store, { reporterStats: stats, isLoading: false })),
          catchError((err) => {
            patchState(store, { isLoading: false, error: 'Failed to load reporter dashboard stats' });
            return of(null);
          })
        ))
      )
    ),
    loadAdminStats: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => dashboardService.getAdminStats().pipe(
          tap((stats) => patchState(store, { adminStats: stats, isLoading: false })),
          catchError((err) => {
            patchState(store, { isLoading: false, error: 'Failed to load admin dashboard stats' });
            return of(null);
          })
        ))
      )
    ),
    loadTechnicianStats: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => dashboardService.getTechnicianStats().pipe(
          tap((stats) => patchState(store, { technicianStats: stats, isLoading: false })),
          catchError((err) => {
            patchState(store, { isLoading: false, error: 'Failed to load technician dashboard stats' });
            return of(null);
          })
        ))
      )
    )
  }))
);
