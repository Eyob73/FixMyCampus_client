import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';
import { DashboardStore } from '../../../store/dashboard.store';
import { AuthService } from '../../../services/auth.service';
import { NotificationStore } from '../../../store/notification.store';
import {
  Ticket,
  TicketStatus,
} from '../../../models/ticket.model';
import { StatusBadge } from '../../../components/status-badge/status-badge';
import { PriorityBadge } from '../../../components/priority-badge/priority-badge.component';
import { PageContainerComponent } from '../../../layout/page-container/page-container';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadge, PriorityBadge, PageContainerComponent],
  templateUrl: './technician-dashboard.component.html',
})
export class TechnicianDashboardComponent implements OnInit {
  readonly ticketService = inject(TicketService);
  readonly dashboardStore = inject(DashboardStore);
  readonly authService = inject(AuthService);
  private readonly notificationStore = inject(NotificationStore);

  readonly stats = this.dashboardStore.technicianStats;
  readonly recentTickets = computed(() => this.stats()?.recentTickets || []);
  readonly loading = this.dashboardStore.isLoading;

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.dashboardStore.loadTechnicianStats();
  }

  quickStartWork(ticket: Ticket): void {
    this.ticketService.updateStatus(ticket.id, 'IN_PROGRESS', 'Technician started work via quick action.').subscribe({
      next: () => {
        this.notificationStore.showToast({ type: 'success', message: `Ticket #${ticket.id} status updated to IN PROGRESS.` });
        this.refreshData();
      },
      error: () => {
        this.notificationStore.showToast({ type: 'error', message: `Failed to update ticket #${ticket.id}.` });
      },
    });
  }

  get completionRate(): number {
    const s = this.stats();
    if (!s || !s.totalAssigned) return 0;
    const completed = (s.resolved || 0) + (s.closed || 0);
    return Math.round((completed / s.totalAssigned) * 100);
  }

  get assignedPercent(): number {
    const s = this.stats();
    if (!s || !s.totalAssigned) return 0;
    return ((s.newAssigned || 0) / s.totalAssigned) * 100;
  }

  get inProgressPercent(): number {
    const s = this.stats();
    if (!s || !s.totalAssigned) return 0;
    return ((s.inProgress || 0) / s.totalAssigned) * 100;
  }

  get resolvedPercent(): number {
    const s = this.stats();
    if (!s || !s.totalAssigned) return 0;
    return ((s.resolved || 0) / s.totalAssigned) * 100;
  }

  get closedPercent(): number {
    const s = this.stats();
    if (!s || !s.totalAssigned) return 0;
    return ((s.closed || 0) / s.totalAssigned) * 100;
  }

  calcPriorityPercent(count: number | undefined): number {
    const s = this.stats();
    if (!s || !s.totalAssigned || !count) return 0;
    return Math.min(100, Math.round((count / s.totalAssigned) * 100));
  }

  getPriorityDotClass(priority: string): string {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-[#DC2626]';
      case 'HIGH':
        return 'bg-[#EA580C]';
      case 'MEDIUM':
        return 'bg-[#0284C7]';
      default:
        return 'bg-[#64748B]';
    }
  }

  formatTimeAgo(isoString: string): string {
    if (!isoString) return 'recently';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}
