import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { MatCardModule } from '@angular/material/card';
import { StartWorkDialogComponent } from '../../../ui/start-work-dialog/start-work-dialog.component';

Chart.register(...registerables);

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadge, PriorityBadge, PageContainerComponent, MatCardModule, MatDialogModule],
  templateUrl: './technician-dashboard.component.html',
})
export class TechnicianDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lifecycleCanvas') lifecycleCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('urgencyCanvas') urgencyCanvas?: ElementRef<HTMLCanvasElement>;

  private lifecycleChart?: Chart<'doughnut'>;
  private urgencyChart?: Chart<'bar'>;
  private isViewInitialized = false;

  readonly ticketService = inject(TicketService);
  readonly dashboardStore = inject(DashboardStore);
  readonly authService = inject(AuthService);
  private readonly notificationStore = inject(NotificationStore);
  private readonly dialog = inject(MatDialog);

  readonly stats = this.dashboardStore.technicianStats;
  readonly recentTickets = computed(() => this.stats()?.recentTickets || []);
  readonly loading = this.dashboardStore.isLoading;

  constructor() {
    effect(() => {
      const s = this.stats();
      if (this.isViewInitialized && s) {
        this.updateLifecycleChart(s);
        this.updateUrgencyChart(s);
      }
    });
  }

  ngOnInit(): void {
    this.refreshData();
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    const s = this.stats();
    if (s) {
      this.updateLifecycleChart(s);
      this.updateUrgencyChart(s);
    }
  }

  ngOnDestroy(): void {
    this.lifecycleChart?.destroy();
    this.urgencyChart?.destroy();
  }

  private updateLifecycleChart(s: any): void {
    if (!this.lifecycleCanvas?.nativeElement) return;
    const ctx = this.lifecycleCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = ['Assigned', 'In Progress', 'Resolved', 'Closed'];
    const data = [
      s.newAssigned || 0,
      s.inProgress || 0,
      s.resolved || 0,
      s.closed || 0
    ];
    const bgColors = ['#d97706', '#0284c7', '#10b981', '#475569'];

    if (this.lifecycleChart) {
      this.lifecycleChart.data.datasets[0].data = data;
      this.lifecycleChart.update();
      return;
    }

    this.lifecycleChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: bgColors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter, sans-serif', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter, sans-serif', size: 12 },
            padding: 10,
            cornerRadius: 8,
            boxPadding: 4,
            callbacks: {
              label: (item) => ` ${item.label}: ${item.raw} tickets`
            }
          }
        }
      }
    });
  }

  private updateUrgencyChart(s: any): void {
    if (!this.urgencyCanvas?.nativeElement) return;
    const ctx = this.urgencyCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = ['Critical', 'High', 'Medium', 'Low'];
    const data = [
      s.priorityCounts?.critical || 0,
      s.priorityCounts?.high || 0,
      s.priorityCounts?.medium || 0,
      s.priorityCounts?.low || 0
    ];
    const bgColors = ['#dc2626', '#ea580c', '#0284c7', '#64748b'];

    if (this.urgencyChart) {
      this.urgencyChart.data.datasets[0].data = data;
      this.urgencyChart.update();
      return;
    }

    this.urgencyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: bgColors,
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter, sans-serif', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter, sans-serif', size: 12 },
            padding: 10,
            cornerRadius: 8,
            boxPadding: 4,
            callbacks: {
              label: (item) => ` ${item.raw} assigned tickets`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              stepSize: 1,
              color: '#64748b',
              font: { family: 'Inter, sans-serif', size: 11 }
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: '#334155',
              font: { family: 'Inter, sans-serif', size: 11, weight: 'bold' }
            }
          }
        }
      }
    });
  }

  refreshData(): void {
    this.dashboardStore.loadTechnicianStats();
  }

  quickStartWork(ticket: Ticket): void {
    const dialogRef = this.dialog.open(StartWorkDialogComponent, {
      width: '460px',
      panelClass: 'custom-dialog-container',
      data: {
        ticket,
        message: `Are you ready to transition Ticket #${ticket.id} (${ticket.title}) to IN PROGRESS? This signals to facilities dispatch that physical work has begun.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
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
