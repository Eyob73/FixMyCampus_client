import { Component, inject, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../services/dashboard.service';
import { TechnicianStore } from '../../../store/technician.store';
import { TicketStore } from '../../../store/ticket.store';
import { NotificationStore } from '../../../store/notification.store';
import { Technician } from '../../../models';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('techLoadCanvas') techLoadCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('slaTrendCanvas') slaTrendCanvas?: ElementRef<HTMLCanvasElement>;

  private techLoadChart?: Chart<'bar'>;
  private slaTrendChart?: Chart<'line'>;
  private isViewInitialized = false;

  public technicianStore = inject(TechnicianStore);
  public ticketStore = inject(TicketStore);
  private notificationStore = inject(NotificationStore);

  constructor(public dashboardService: DashboardService) {
    effect(() => {
      const techs = this.technicianStore.technicians();
      if (this.isViewInitialized && techs.length > 0) {
        this.updateTechLoadChart(techs);
      }
    });
  }

  ngOnInit(): void {
    this.technicianStore.loadTechnicians();
    this.ticketStore.loadTickets();
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.updateTechLoadChart(this.technicianStore.technicians());
    this.initSlaTrendChart();
  }

  ngOnDestroy(): void {
    this.techLoadChart?.destroy();
    this.slaTrendChart?.destroy();
  }

  private updateTechLoadChart(technicians: Technician[]): void {
    if (!this.techLoadCanvas?.nativeElement) return;
    const ctx = this.techLoadCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = technicians.map((t) => t.name.split(' ')[0] || t.name);
    const activeData = technicians.map((t) => t.activeTicketsCount || 0);
    const resolvedData = technicians.map((t) => t.resolvedTicketsCount || 0);

    if (this.techLoadChart) {
      this.techLoadChart.data.labels = labels;
      this.techLoadChart.data.datasets[0].data = activeData;
      this.techLoadChart.data.datasets[1].data = resolvedData;
      this.techLoadChart.update();
      return;
    }

    this.techLoadChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Active Work Orders',
            data: activeData,
            backgroundColor: '#0284c7',
            hoverBackgroundColor: '#0369a1',
            borderRadius: 6,
            barPercentage: 0.65,
            categoryPercentage: 0.6
          },
          {
            label: 'Resolved (Quarter)',
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
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Inter, sans-serif', size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter, sans-serif', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter, sans-serif', size: 12 },
            padding: 10,
            cornerRadius: 8
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
            grid: { color: '#f1f5f9' },
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

  private initSlaTrendChart(): void {
    if (!this.slaTrendCanvas?.nativeElement) return;
    const ctx = this.slaTrendCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const rates = [94.5, 95.8, 93.2, 97.1, 96.4, 98.0, 96.4];

    this.slaTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'SLA Compliance (%)',
            data: rates,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Baseline Target (92%)',
            data: [92, 92, 92, 92, 92, 92, 92],
            borderColor: '#f59e0b',
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Inter, sans-serif', size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter, sans-serif', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter, sans-serif', size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${item.raw}%`
            }
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
            min: 85,
            max: 100,
            grid: { color: '#f1f5f9' },
            ticks: {
              stepSize: 5,
              callback: (value) => `${value}%`,
              color: '#64748b',
              font: { family: 'Inter, sans-serif', size: 11 }
            }
          }
        }
      }
    });
  }

  exportAudit(): void {
    this.notificationStore.showToast({
      type: 'success',
      message: 'Download initiated for facilities operational audit logs.'
    });
  }
}
