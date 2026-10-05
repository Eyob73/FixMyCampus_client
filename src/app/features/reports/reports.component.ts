import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { TechnicianService } from '../../services/technician.service';
import { TicketService } from '../../services/ticket.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  constructor(
    public dashboardService: DashboardService,
    public technicianService: TechnicianService,
    public ticketService: TicketService,
    private notificationService: NotificationService
  ) {}

  exportAudit(): void {
    this.notificationService.success(
      'Audit Package Generated',
      'Download initiated for complete facilities operational logs (Q3/Q4).'
    );
  }
}
