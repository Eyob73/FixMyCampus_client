import { Component, computed, signal, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { StatCardComponent } from '../../../components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../ui/badge/status-badge.component';
import { MatCardModule } from '@angular/material/card';
import { DashboardStore } from '../../../store/dashboard.store';
import { TicketStore } from '../../../store/ticket.store';
import { NotificationStore } from '../../../store/notification.store';
import { Ticket, CategoryMetric, PriorityMetric, WeeklyVelocity } from '../../../models';

Chart.register(...registerables);

const DISTINCT_CATEGORY_PALETTE: string[] = [
  '#0284c7', // Sky Blue
  '#2563eb', // Royal Blue
  '#d97706', // Amber
  '#059669', // Emerald
  '#0d9488', // Teal
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#e11d48', // Rose Red
  '#65a30d', // Lime
  '#475569', // Slate
  '#0369a1', // Deep Sky
  '#b45309'  // Bronze
];

const KNOWN_CATEGORY_KEYWORDS: Array<{ matches: string[]; color: string }> = [
  { matches: ['plumb'], color: '#2563eb' },
  { matches: ['electr', 'power', 'light'], color: '#d97706' },
  { matches: ['hvac', 'climat', 'heat', 'air', 'cool', 'vent'], color: '#0284c7' },
  { matches: ['struct', 'door', 'lock', 'wall', 'window', 'roof'], color: '#059669' },
  { matches: ['net', 'wifi', 'wi-fi', 'it', 'secur', 'camera'], color: '#0d9488' },
  { matches: ['equip', 'device', 'applian', 'project'], color: '#0891b2' },
  { matches: ['furnit', 'chair', 'desk', 'table'], color: '#ea580c' },
  { matches: ['clean', 'sanit', 'ground', 'spill', 'trash'], color: '#10b981' },
  { matches: ['safe', 'alarm', 'fire', 'hazard'], color: '#e11d48' },
  { matches: ['other', 'gen'], color: '#64748b' }
];

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#0284c7',
  LOW: '#10b981'
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, StatusBadgeComponent, MatCardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('categoryCanvas') categoryCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('velocityCanvas') velocityCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('priorityCanvas') priorityCanvas?: ElementRef<HTMLCanvasElement>;

  private categoryChart?: Chart<'doughnut'>;
  private velocityChart?: Chart<'bar'>;
  private priorityChart?: Chart<'bar'>;
  private isViewInitialized = false;

  selectedStatusFilter = signal<string>('ALL');

  public dashboardStore = inject(DashboardStore);
  public ticketStore = inject(TicketStore);
  private notificationStore = inject(NotificationStore);
  private router = inject(Router);

  totalTicketsCount = computed(() => this.ticketStore.tickets().length);
  weeklyCreatedTotal = computed(() =>
    this.dashboardStore.weeklyVelocity().reduce((acc, v) => acc + (v.created || 0), 0)
  );
  weeklyResolvedTotal = computed(() =>
    this.dashboardStore.weeklyVelocity().reduce((acc, v) => acc + (v.resolved || 0), 0)
  );

  // Filtered recent tickets based on clicked card or filter
  filteredRecentTickets = computed<Ticket[]>(() => {
    const tickets = this.ticketStore.tickets();
    const filter = this.selectedStatusFilter();

    if (filter === 'UNASSIGNED') {
      return tickets.filter((t) => !t.assignedTechnicianId && t.status !== 'CLOSED').slice(0, 6);
    }
    if (filter === 'OPEN') {
      return tickets.filter((t) => t.status === 'NEW' || t.status === 'ASSIGNED').slice(0, 6);
    }
    if (filter === 'IN_PROGRESS') {
      return tickets.filter((t) => t.status === 'IN_PROGRESS').slice(0, 6);
    }
    if (filter === 'RESOLVED') {
      return tickets.filter((t) => t.status === 'RESOLVED').slice(0, 6);
    }
    if (filter === 'CLOSED') {
      return tickets.filter((t) => t.status === 'CLOSED').slice(0, 6);
    }
    return tickets.slice(0, 6);
  });

  constructor() {
    effect(() => {
      const cat = this.dashboardStore.categoryMetrics();
      const vel = this.dashboardStore.weeklyVelocity();
      const pri = this.dashboardStore.priorityMetrics();

      if (this.isViewInitialized) {
        this.updateCategoryChart(cat);
        this.updateVelocityChart(vel);
        this.updatePriorityChart(pri);
      }
    });
  }

  ngOnInit(): void {
    this.ticketStore.loadTickets();
    this.dashboardStore.loadAdminStats();
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.updateCategoryChart(this.dashboardStore.categoryMetrics());
    this.updateVelocityChart(this.dashboardStore.weeklyVelocity());
    this.updatePriorityChart(this.dashboardStore.priorityMetrics());
  }

  ngOnDestroy(): void {
    this.categoryChart?.destroy();
    this.velocityChart?.destroy();
    this.priorityChart?.destroy();
  }

  formatCategoryName(category: string): string {
    return category.replace('_', ' ');
  }

  getCategoryColor(category: string, fallbackIndex = 0): string {
    if (!category) {
      return DISTINCT_CATEGORY_PALETTE[fallbackIndex % DISTINCT_CATEGORY_PALETTE.length];
    }

    const norm = category.toLowerCase().trim();

    for (const entry of KNOWN_CATEGORY_KEYWORDS) {
      if (entry.matches.some((k) => norm.includes(k))) {
        return entry.color;
      }
    }

    return DISTINCT_CATEGORY_PALETTE[fallbackIndex % DISTINCT_CATEGORY_PALETTE.length];
  }

  private updateCategoryChart(metrics: CategoryMetric[]): void {
    if (!this.categoryCanvas?.nativeElement) return;
    const ctx = this.categoryCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = metrics.length ? metrics.map((m) => this.formatCategoryName(m.category)) : ['None'];
    const data = metrics.length ? metrics.map((m) => m.count) : [0];
    const bgColors = metrics.length
      ? metrics.map((m, idx) => this.getCategoryColor(m.category, idx))
      : ['#e2e8f0'];

    if (this.categoryChart) {
      this.categoryChart.data.labels = labels;
      this.categoryChart.data.datasets[0].data = data;
      this.categoryChart.data.datasets[0].backgroundColor = bgColors;
      this.categoryChart.update();
      return;
    }

    this.categoryChart = new Chart(ctx, {
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
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter, sans-serif', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter, sans-serif', size: 12 },
            padding: 10,
            cornerRadius: 8,
            boxPadding: 4,
            callbacks: {
              label: (item) => {
                const metric = metrics[item.dataIndex];
                const pct = metric ? ` (${metric.percentage}%)` : '';
                return ` ${item.label}: ${item.raw} orders${pct}`;
              }
            }
          }
        }
      }
    });
  }

  private updateVelocityChart(velocity: WeeklyVelocity[]): void {
    if (!this.velocityCanvas?.nativeElement) return;
    const ctx = this.velocityCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = velocity.map((v) => v.day);
    const createdData = velocity.map((v) => v.created);
    const resolvedData = velocity.map((v) => v.resolved);

    if (this.velocityChart) {
      this.velocityChart.data.labels = labels;
      this.velocityChart.data.datasets[0].data = createdData;
      this.velocityChart.data.datasets[1].data = resolvedData;
      this.velocityChart.update();
      return;
    }

    this.velocityChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Created',
            data: createdData,
            backgroundColor: '#3b82f6',
            hoverBackgroundColor: '#2563eb',
            borderRadius: 6,
            barPercentage: 0.65,
            categoryPercentage: 0.6
          },
          {
            label: 'Resolved',
            data: resolvedData,
            backgroundColor: '#10b981',
            hoverBackgroundColor: '#059669',
            borderRadius: 6,
            barPercentage: 0.65,
            categoryPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter, sans-serif', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter, sans-serif', size: 12 },
            padding: 10,
            cornerRadius: 8,
            boxPadding: 4
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748b',
              font: { family: 'Inter, sans-serif', size: 11, weight: 500 }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#f1f5f9'
            },
            ticks: {
              stepSize: 1,
              color: '#64748b',
              font: { family: 'Inter, sans-serif', size: 11 }
            }
          }
        }
      }
    });
  }

  private updatePriorityChart(priorities: PriorityMetric[]): void {
    if (!this.priorityCanvas?.nativeElement) return;
    const ctx = this.priorityCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = priorities.map((p) => p.priority);
    const data = priorities.map((p) => p.count);
    const bgColors = priorities.map((p) => PRIORITY_COLORS[p.priority] || '#64748b');

    if (this.priorityChart) {
      this.priorityChart.data.labels = labels;
      this.priorityChart.data.datasets[0].data = data;
      this.priorityChart.data.datasets[0].backgroundColor = bgColors;
      this.priorityChart.update();
      return;
    }

    this.priorityChart = new Chart(ctx, {
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
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter, sans-serif', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter, sans-serif', size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (item) => ` ${item.raw} active work orders`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: '#f1f5f9'
            },
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

  filterBy(status: string): void {
    if (this.selectedStatusFilter() === status) {
      this.selectedStatusFilter.set('ALL');
    } else {
      this.selectedStatusFilter.set(status);
    }
  }

  viewAllTickets(statusFilter?: string): void {
    if (statusFilter && statusFilter !== 'ALL') {
      this.router.navigate(['/admin/tickets'], { queryParams: { status: statusFilter } });
    } else {
      this.router.navigate(['/admin/tickets']);
    }
  }

  exportReport(): void {
    const total = this.ticketStore.tickets().length;
    this.notificationStore.showToast({
      type: 'success',
      message: `CSV report generated for ${total} active work orders.`
    });
  }

  broadcastAlert(): void {
    this.notificationStore.showToast({
      type: 'info',
      message: 'Maintenance alert notification broadcasted to facilities staff.'
    });
  }
}
