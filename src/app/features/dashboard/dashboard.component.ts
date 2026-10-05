import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../ui/badge/status-badge.component';
import { DashboardService } from '../../services/dashboard.service';
import { TicketService } from '../../services/ticket.service';
import { NotificationService } from '../../services/notification.service';
import { Ticket } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, StatusBadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  selectedStatusFilter = signal<string>('ALL');

  // Filtered recent tickets based on clicked card or filter
  filteredRecentTickets = computed<Ticket[]>(() => {
    const tickets = this.ticketService.tickets();
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

  constructor(
    public dashboardService: DashboardService,
    public ticketService: TicketService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

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
    this.notificationService.success(
      'Operational Log Exported',
      'CSV report generated for 8 active facilities and 15 work orders.'
    );
  }

  broadcastAlert(): void {
    this.notificationService.info(
      'Campus Dispatch Notice',
      'Chilled water pipeline maintenance scheduled for Science Quad between 18:00 - 22:00.'
    );
  }
}
