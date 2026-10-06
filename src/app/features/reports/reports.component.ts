import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { TechnicianStore } from '../../store/technician.store';
import { TicketStore } from '../../store/ticket.store';
import { NotificationStore } from '../../store/notification.store';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  public technicianStore = inject(TechnicianStore);
  public ticketStore = inject(TicketStore);
  private notificationStore = inject(NotificationStore);

  constructor(
    public dashboardService: DashboardService
  ) {}

  exportAudit(): void {
    this.notificationStore.showToast({
      type: 'success',
      message: 'Download initiated for complete facilities operational logs (Q3/Q4).'
    });
  }
}
