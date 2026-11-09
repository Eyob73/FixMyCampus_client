import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StatusBadgeComponent } from '../../../../ui/badge/status-badge.component';
import { NotificationStore } from '../../../../store/notification.store';
import { ReporterStore } from '../../../../store/reporter.store';
import { ReporterService } from '../../../../services/reporter.service';
import { Reporter, ReporterStatus } from '../../../../models';
import { ReporterDetailDialogComponent } from '../reporter-detail-dialog/reporter-detail-dialog.component';
import { ReporterFormDialogComponent } from '../reporter-form-dialog/reporter-form-dialog.component';
import { ReporterDeleteDialogComponent } from '../reporter-delete-dialog/reporter-delete-dialog.component';

@Component({
  selector: 'app-reporter-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, MatDialogModule],
  templateUrl: './reporter-list.component.html',
  styleUrl: './reporter-list.component.css'
})
export class ReporterListComponent implements OnInit {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private notificationStore = inject(NotificationStore);
  private reporterService = inject(ReporterService);
  public reporterStore = inject(ReporterStore);

  // Local filter models
  searchQuery = '';
  statusFilter = 'ALL';
  sortBy = 'createdAt';
  sortDescending = true;
  pageSize = 10;

  ngOnInit(): void {
    this.reporterStore.loadReporters({
      page: 1,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDescending: this.sortDescending
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.reporterStore.setSearch(query);
  }

  onStatusChange(status: string): void {
    this.statusFilter = status;
    this.reporterStore.setStatusFilter(status);
  }

  onSortChange(sortField: string): void {
    this.sortBy = sortField;
    this.reporterStore.setSorting(sortField);
  }

  toggleSortDirection(): void {
    this.sortDescending = !this.sortDescending;
    this.reporterStore.loadReporters({
      sortDescending: this.sortDescending,
      page: 1
    });
  }

  onPageChange(page: number): void {
    this.reporterStore.setPage(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.reporterStore.setPageSize(size);
  }

  getInitials(name: string): string {
    if (!name) return 'R';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  openCreateReporter(): void {
    const dialogRef = this.dialog.open(ReporterFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: {}
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.reporterStore.loadReporters({ page: 1 });
      }
    });
  }

  openEditReporter(rep: Reporter): void {
    const dialogRef = this.dialog.open(ReporterFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { reporter: rep }
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (updated) {
        this.reporterStore.loadReporters();
      }
    });
  }

  openDeleteReporter(rep: Reporter): void {
    const dialogRef = this.dialog.open(ReporterDeleteDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { reporter: rep }
    });

    dialogRef.afterClosed().subscribe((deleted) => {
      if (deleted) {
        this.reporterStore.loadReporters();
      }
    });
  }

  viewReporterDetails(rep: Reporter): void {
    this.dialog.open(ReporterDetailDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: {
        reporter: rep
      }
    });
  }

  navigateToReporter(rep: Reporter): void {
    this.router.navigate(['/admin/reporters', rep.id]);
  }

  updateReporterStatus(rep: Reporter, newStatus: ReporterStatus): void {
    if (rep.status === newStatus) return;

    this.reporterService.updateStatus(rep.id, newStatus).subscribe({
      next: (updated) => {
        this.reporterStore.loadReporters();
        this.notificationStore.showToast({
          type: 'success',
          message: `${rep.name} status updated to ${newStatus}.`
        });
      },
      error: (err) => {
        this.notificationStore.showToast({
          type: 'error',
          message: err.error?.message || err.error?.Message || 'Failed to update account status.'
        });
      }
    });
  }
}
