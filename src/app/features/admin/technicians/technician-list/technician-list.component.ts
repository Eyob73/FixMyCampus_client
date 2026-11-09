import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StatusBadgeComponent } from '../../../../ui/badge/status-badge.component';
import { NotificationStore } from '../../../../store/notification.store';
import { TechnicianStore } from '../../../../store/technician.store';
import { TechnicianService } from '../../../../services/technician.service';
import { Technician, TechnicianStatus } from '../../../../models';
import { TechnicianDetailDialogComponent } from '../technician-detail-dialog/technician-detail-dialog.component';
import { TechnicianFormDialogComponent } from '../technician-form-dialog/technician-form-dialog.component';
import { TechnicianDeleteDialogComponent } from '../technician-delete-dialog/technician-delete-dialog.component';

@Component({
  selector: 'app-technician-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, MatDialogModule],
  templateUrl: './technician-list.component.html',
  styleUrl: './technician-list.component.css'
})
export class TechnicianListComponent implements OnInit {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private notificationStore = inject(NotificationStore);
  private technicianService = inject(TechnicianService);
  public technicianStore = inject(TechnicianStore);

  // Local filter models
  searchQuery = '';
  statusFilter = 'ALL';
  departmentFilter = 'ALL';
  sortBy = 'createdAt';
  sortDescending = true;
  pageSize = 10;

  ngOnInit(): void {
    this.technicianStore.loadTechnicians({
      page: 1,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDescending: this.sortDescending
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.technicianStore.setSearch(query);
  }

  onStatusChange(status: string): void {
    this.statusFilter = status;
    this.technicianStore.setStatusFilter(status);
  }

  onDepartmentChange(dept: string): void {
    this.departmentFilter = dept;
    this.technicianStore.setDepartmentFilter(dept);
  }

  onSortChange(sortField: string): void {
    this.sortBy = sortField;
    this.technicianStore.setSorting(sortField);
  }

  toggleSortDirection(): void {
    this.sortDescending = !this.sortDescending;
    this.technicianStore.loadTechnicians({
      sortDescending: this.sortDescending,
      page: 1
    });
  }

  onPageChange(page: number): void {
    this.technicianStore.setPage(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.technicianStore.setPageSize(size);
  }

  getInitials(name: string): string {
    if (!name) return 'TC';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  openCreateTechnician(): void {
    const dialogRef = this.dialog.open(TechnicianFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: {}
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.technicianStore.loadTechnicians({ page: 1 });
      }
    });
  }

  openEditTechnician(tech: Technician): void {
    const dialogRef = this.dialog.open(TechnicianFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { technician: tech }
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (updated) {
        this.technicianStore.loadTechnicians();
      }
    });
  }

  openDeleteTechnician(tech: Technician): void {
    const dialogRef = this.dialog.open(TechnicianDeleteDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { technician: tech }
    });

    dialogRef.afterClosed().subscribe((deleted) => {
      if (deleted) {
        this.technicianStore.loadTechnicians();
      }
    });
  }

  viewTechnicianDetails(tech: Technician): void {
    this.dialog.open(TechnicianDetailDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: {
        technician: tech
      }
    });
  }

  navigateToTechnician(tech: Technician): void {
    this.router.navigate(['/admin/technicians', tech.id]);
  }

  updateTechnicianStatus(tech: Technician, newStatus: string): void {
    if (tech.status === newStatus) return;

    this.technicianStore.toggleTechnicianStatus({
      id: tech.id,
      newStatus
    });

    this.notificationStore.showToast({
      type: 'info',
      message: `Updated ${tech.name} status to ${newStatus}.`
    });
  }
}
