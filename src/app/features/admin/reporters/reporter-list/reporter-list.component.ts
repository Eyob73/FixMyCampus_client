import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StatusBadgeComponent } from '../../../../ui/badge/status-badge.component';
import { NotificationStore } from '../../../../store/notification.store';
import { ReporterStore } from '../../../../store/reporter.store';
import { TicketStore } from '../../../../store/ticket.store';
import { Reporter, ReporterRole, ReporterStatus } from '../../../../models';
import { ReporterDetailDialogComponent } from '../reporter-detail-dialog/reporter-detail-dialog.component';

@Component({
  selector: 'app-reporter-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, MatDialogModule],
  templateUrl: './reporter-list.component.html',
  styleUrl: './reporter-list.component.css'
})
export class ReporterListComponent implements OnInit {
  private dialog = inject(MatDialog);
  private notificationStore = inject(NotificationStore);
  public reporterStore = inject(ReporterStore);
  public ticketStore = inject(TicketStore);

  ngOnInit() {
    this.reporterStore.loadReporters();
  }

  searchQuery = signal<string>('');
  roleFilter = signal<ReporterRole | 'ALL'>('ALL');

  filteredReporters = computed<Reporter[]>(() => {
    let list = this.reporterStore.reporters();
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

  viewReporter(rep: Reporter): void {
    const tickets = this.ticketStore.tickets().filter(
      (t) => t.reporterId === rep.id || t.reporterEmail === rep.email
    );

    this.dialog.open(ReporterDetailDialogComponent, {
      width: '580px',
      maxWidth: '95vw',
      data: {
        reporter: rep,
        tickets
      }
    });
  }

  toggleReporterStatus(rep: Reporter): void {
    const nextStatus: ReporterStatus = rep.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.reporterStore.toggleReporterStatus({ id: rep.id, newStatus: nextStatus });
    this.notificationStore.showToast({
      type: 'success',
      message: `${rep.name} status set to ${nextStatus}.`
    });
  }
}
