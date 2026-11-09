import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../../../ui/badge/status-badge.component';
import { TechnicianService } from '../../../../services/technician.service';
import { NotificationStore } from '../../../../store/notification.store';
import { TechnicianDetail, TechnicianStatus } from '../../../../models';
import { TechnicianFormDialogComponent } from '../technician-form-dialog/technician-form-dialog.component';
import { TechnicianDeleteDialogComponent } from '../technician-delete-dialog/technician-delete-dialog.component';

@Component({
  selector: 'app-technician-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, MatDialogModule],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb Navigation -->
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <a routerLink="/admin/dashboard" class="hover:text-primary transition-colors">Admin</a>
        <span>/</span>
        <a routerLink="/admin/technicians" class="hover:text-primary transition-colors">Technicians</a>
        <span>/</span>
        <span class="text-slate-800 font-semibold">{{ technician?.name || 'Technician Details' }}</span>
      </div>

      @if (isLoading) {
        <div class="p-12 text-center bg-white rounded-xl border border-slate-200">
          <span class="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin inline-block"></span>
          <p class="text-xs text-slate-500 mt-2">Loading technician profile...</p>
        </div>
      } @else if (error) {
        <div class="p-8 text-center bg-white rounded-xl border border-rose-200 space-y-3">
          <span class="material-symbols-outlined text-4xl text-rose-500">error</span>
          <h3 class="text-base font-bold text-slate-900">Technician Not Found</h3>
          <p class="text-xs text-slate-500 max-w-md mx-auto">{{ error }}</p>
          <a
            routerLink="/admin/technicians"
            class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
          >
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Back to Technicians
          </a>
        </div>
      } @else if (technician) {
        <!-- Page Header -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-blue-50 text-primary border border-blue-200 flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
              {{ getInitials(technician.name) }}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-xl font-bold text-slate-900 m-0">{{ technician.name }}</h1>
                <app-status-badge [status]="technician.status"></app-status-badge>
              </div>
              <p class="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{{ technician.email }}</span>
                <span>•</span>
                <span>{{ technician.department }}</span>
                <span>•</span>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                  {{ technician.specialty }}
                </span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              (click)="openEdit()"
              class="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">edit</span>
              Edit Profile
            </button>

            <button
              type="button"
              (click)="openDelete()"
              class="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">delete</span>
              Delete Account
            </button>
          </div>
        </div>

        <!-- 3-Column Statistics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Active Work Orders</span>
              <div class="text-2xl font-bold text-blue-600 mt-1">{{ technician.activeTicketsCount ?? 0 }}</div>
              <span class="text-[11px] text-slate-500">Currently in progress</span>
            </div>
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-xl">pending_actions</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Resolved Tickets</span>
              <div class="text-2xl font-bold text-emerald-600 mt-1">{{ technician.resolvedTicketsCount ?? 0 }}</div>
              <span class="text-[11px] text-slate-500">Successfully completed</span>
            </div>
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-xl">task_alt</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Performance Rating</span>
              <div class="text-2xl font-bold text-amber-600 mt-1">★ {{ technician.rating || 5.0 }}</div>
              <span class="text-[11px] text-slate-500">Out of 5.0 stars</span>
            </div>
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-xl">star</span>
            </div>
          </div>
        </div>

        <!-- Two Column Layout: Profile Information & Assigned Tickets -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column: Technician Profile Card -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider m-0 pb-3 border-b border-slate-100 flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-primary">badge</span>
              <span>Personnel Information</span>
            </h2>

            <div class="space-y-3 text-xs">
              <div>
                <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Email Address</span>
                <a [href]="'mailto:' + technician.email" class="text-slate-800 font-medium hover:text-primary transition-colors">
                  {{ technician.email }}
                </a>
              </div>

              <div>
                <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Phone Number</span>
                <span class="text-slate-800 font-medium">{{ technician.phone || 'Not provided' }}</span>
              </div>

              <div>
                <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Assigned Department</span>
                <span class="text-slate-800 font-medium">{{ technician.department }}</span>
              </div>

              <div>
                <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Primary Specialty</span>
                <span class="text-slate-800 font-medium">{{ technician.specialty }}</span>
              </div>

              <div>
                <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Roster Join Date</span>
                <span class="text-slate-800 font-medium">{{ technician.createdAt | date:'mediumDate' }}</span>
              </div>

              <div class="pt-2 border-t border-slate-100">
                <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider mb-1.5">Change Availability Status</span>
                <select
                  [ngModel]="technician.status"
                  (ngModelChange)="onStatusChange($event)"
                  class="w-full text-xs font-semibold py-1.5 px-2 border border-slate-300 rounded bg-slate-50 text-slate-800 focus:bg-white focus:outline-hidden focus:border-primary cursor-pointer"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="ON_CALL">On Call</option>
                  <option value="OFF_DUTY">Off Duty</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Right Column: Assigned Tickets Table -->
          <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between">
            <div>
              <div class="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 class="text-sm font-bold text-slate-900 m-0">Assigned Work Orders</h2>
                  <p class="text-xs text-slate-500 m-0 mt-0.5">
                    Tickets assigned to {{ technician.name }}
                  </p>
                </div>
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {{ assignedTickets.length }} Tickets
                </span>
              </div>

              @if (assignedTickets.length === 0) {
                <div class="p-12 text-center text-xs text-slate-400 space-y-2">
                  <span class="material-symbols-outlined text-4xl text-slate-300">task_alt</span>
                  <p class="m-0 font-medium">No tickets currently assigned to this technician.</p>
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th class="py-3 px-4">Title / Location</th>
                        <th class="py-3 px-4">Category</th>
                        <th class="py-3 px-4">Priority</th>
                        <th class="py-3 px-4">Status</th>
                        <th class="py-3 px-4">Assigned</th>
                        <th class="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (ticket of assignedTickets; track ticket.id) {
                        <tr class="hover:bg-slate-50/80 transition-colors">
                          <td class="py-3 px-4">
                            <a [routerLink]="['/admin/tickets', ticket.id]" class="font-bold text-slate-900 hover:text-primary transition-colors block">
                              {{ ticket.title || ('Work Order #' + (ticket.id ? ticket.id.substring(0, 8) : '')) }}
                            </a>
                            <span class="text-[11px] text-slate-500">
                              {{ ticket.building || 'Campus Facility' }}{{ ticket.room ? ' - ' + ticket.room : '' }}
                            </span>
                          </td>
                          <td class="py-3 px-4 text-slate-600">{{ ticket.category || 'General' }}</td>
                          <td class="py-3 px-4">
                            <span
                              class="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                              [ngClass]="getPriorityClasses(ticket.priority)"
                            >
                              {{ ticket.priority }}
                            </span>
                          </td>
                          <td class="py-3 px-4">
                            <app-status-badge [status]="ticket.status"></app-status-badge>
                          </td>
                          <td class="py-3 px-4 text-slate-500">
                            {{ ticket.createdAt | date:'shortDate' }}
                          </td>
                          <td class="py-3 px-4 text-right">
                            <a
                              [routerLink]="['/admin/tickets', ticket.id]"
                              class="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                            >
                              <span>View</span>
                              <span class="material-symbols-outlined text-sm">arrow_forward</span>
                            </a>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TechnicianDetailComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private technicianService = inject(TechnicianService);
  private notificationStore = inject(NotificationStore);
  private dialog = inject(MatDialog);

  technician: TechnicianDetail | null = null;
  assignedTickets: any[] = [];
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadTechnician(id);
      } else {
        this.error = 'Invalid technician identifier.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadTechnician(id: string): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.technicianService.getTechnicianById(id).subscribe({
      next: (detail) => {
        this.technician = detail;
        this.assignedTickets = detail.assignedTickets || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || err.error?.Message || 'Failed to retrieve technician details.';
        this.cdr.markForCheck();
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'TC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getPriorityClasses(priority: string): string {
    const p = (priority || '').toLowerCase();
    switch (p) {
      case 'critical':
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  onStatusChange(newStatus: string): void {
    if (!this.technician) return;

    this.technicianService.updateTechnicianStatus(this.technician.id, newStatus).subscribe({
      next: (updated) => {
        if (this.technician) {
          this.technician.status = updated.status as TechnicianStatus;
        }
        this.notificationStore.showToast({
          type: 'success',
          message: `Technician status updated to ${newStatus}.`
        });
      },
      error: () => {
        this.notificationStore.showToast({
          type: 'error',
          message: 'Failed to update technician status.'
        });
      }
    });
  }

  openEdit(): void {
    if (!this.technician) return;

    const dialogRef = this.dialog.open(TechnicianFormDialogComponent, {
      width: '540px',
      maxWidth: '95vw',
      data: { technician: this.technician }
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (updated && this.technician) {
        this.technician = { ...this.technician, ...updated };
      }
    });
  }

  openDelete(): void {
    if (!this.technician) return;

    const dialogRef = this.dialog.open(TechnicianDeleteDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { technician: this.technician }
    });

    dialogRef.afterClosed().subscribe((deleted) => {
      if (deleted) {
        this.router.navigate(['/admin/technicians']);
      }
    });
  }
}

