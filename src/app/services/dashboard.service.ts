import { Injectable, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TicketService } from './ticket.service';
import { CategoryMetric, DashboardMetrics, PriorityMetric, WeeklyVelocity } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  // Dynamically calculate metrics from ticket store
  public readonly metrics = computed<DashboardMetrics>(() => {
    const all = this.ticketService.tickets();
    const totalTickets = all.length;
    const openTickets = all.filter((t) => t.status === 'NEW' || t.status === 'ASSIGNED').length;
    const inProgressTickets = all.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolvedTickets = all.filter((t) => t.status === 'RESOLVED').length;
    const closedTickets = all.filter((t) => t.status === 'CLOSED').length;
    const unassignedTickets = all.filter((t) => !t.assignedTechnicianId && t.status !== 'CLOSED').length;

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      unassignedTickets,
      avgResolutionHours: 4.8,
      slaComplianceRate: 96.4
    };
  });

  public readonly categoryMetrics = computed<CategoryMetric[]>(() => {
    const all = this.ticketService.tickets();
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

  public readonly priorityMetrics = computed<PriorityMetric[]>(() => {
    const all = this.ticketService.tickets();
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

  public readonly weeklyVelocity: WeeklyVelocity[] = [
    { day: 'Mon', created: 8, resolved: 6 },
    { day: 'Tue', created: 12, resolved: 11 },
    { day: 'Wed', created: 9, resolved: 14 },
    { day: 'Thu', created: 15, resolved: 12 },
    { day: 'Fri', created: 11, resolved: 16 },
    { day: 'Sat', created: 4, resolved: 5 },
    { day: 'Sun', created: 3, resolved: 3 }
  ];

  constructor(
    private http: HttpClient,
    private ticketService: TicketService
  ) {}

  public getStats(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/stats`).pipe(
      catchError(() => {
        return of(this.metrics());
      })
    );
  }
}
