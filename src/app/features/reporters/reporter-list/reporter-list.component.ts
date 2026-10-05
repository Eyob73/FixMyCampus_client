import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../../ui/badge/status-badge.component';
import { NotificationService } from '../../../services/notification.service';
import { ReporterService } from '../../../services/reporter.service';
import { TicketService } from '../../../services/ticket.service';
import { Reporter, ReporterRole, ReporterStatus, Ticket } from '../../../models';

@Component({
  selector: 'app-reporter-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent],
  templateUrl: './reporter-list.component.html',
  styleUrl: './reporter-list.component.css'
})
export class ReporterListComponent {
  searchQuery = signal<string>('');
  roleFilter = signal<ReporterRole | 'ALL'>('ALL');

  selectedReporter = signal<Reporter | null>(null);
  showDetailModal = false;

  filteredReporters = computed<Reporter[]>(() => {
    let list = this.reporterService.reporters();
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.roleFilter();

    if (query) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.email.toLowerCase().includes(query) ||
          r.department.toLowerCase().includes(query)
      );
    }

    if (role !== 'ALL') {
      list = list.filter((r) => r.role === role);
    }

    return list;
  });

  // History tickets for selected reporter
  selectedReporterTickets = computed<Ticket[]>(() => {
    const rep = this.selectedReporter();
    if (!rep) return [];
    return this.ticketService.tickets().filter((t) => t.reporterId === rep.id || t.reporterEmail === rep.email);
  });

  constructor(
    public reporterService: ReporterService,
    public ticketService: TicketService,
    private notificationService: NotificationService
  ) {}

  viewReporter(rep: Reporter): void {
    this.selectedReporter.set(rep);
    this.showDetailModal = true;
  }

  toggleReporterStatus(rep: Reporter): void {
    const nextStatus: ReporterStatus = rep.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.reporterService.toggleStatus(rep.id, nextStatus).subscribe({
      next: (updated) => {
        this.selectedReporter.set(updated);
        this.notificationService.success(
          'Account Updated',
          `${rep.name} status set to ${nextStatus}.`
        );
      }
    });
  }
}
