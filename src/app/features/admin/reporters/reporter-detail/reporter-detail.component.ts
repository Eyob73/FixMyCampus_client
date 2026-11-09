import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StatusBadgeComponent } from '../../../../ui/badge/status-badge.component';
import { ReporterService } from '../../../../services/reporter.service';
import { NotificationStore } from '../../../../store/notification.store';
import { ReporterDetail, ReporterStatus } from '../../../../models';
import { ReporterFormDialogComponent } from '../reporter-form-dialog/reporter-form-dialog.component';
import { ReporterDeleteDialogComponent } from '../reporter-delete-dialog/reporter-delete-dialog.component';

@Component({
  selector: 'app-reporter-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, MatDialogModule],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb Navigation -->
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <a routerLink="/admin/dashboard" class="hover:text-primary transition-colors">Admin</a>
        <span>/</span>
        <a routerLink="/admin/reporters" class="hover:text-primary transition-colors">Reporters</a>
        <span>/</span>
        <span class="text-slate-800 font-semibold">{{ reporter?.name || 'Reporter Details' }}</span>
      </div>

      @if (isLoading) {
        <div class="p-12 text-center bg-white rounded-xl border border-slate-200">
          <span class="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin inline-block"></span>
          <p class="text-xs text-slate-500 mt-2">Loading reporter profile...</p>
        </div>
      } @else if (error) {
        <div class="p-8 text-center bg-white rounded-xl border border-rose-200 space-y-3">
          <span class="material-symbols-outlined text-4xl text-rose-500">error</span>
          <h3 class="text-base font-bold text-slate-900">Reporter Not Found</h3>
          <p class="text-xs text-slate-500 max-w-md mx-auto">{{ error }}</p>
          <a
            routerLink="/admin/reporters"
            class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
          >
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Back to Reporters
          </a>
        </div>
      } @else if (reporter) {
        <!-- Page Header -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-blue-50 text-primary border border-blue-200 flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
              {{ getInitials(reporter.name) }}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-xl font-bold text-slate-900 m-0">{{ reporter.name }}</h1>
                <app-status-badge [status]="reporter.status"></app-status-badge>
              </div>
              <p class="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{{ reporter.email }}</span>
                <span>•</span>
                <span>{{ reporter.department || 'General Campus' }}</span>
                <span>•</span>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                  {{ reporter.role }}
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

        <!-- Issue Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span class="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">Total Submissions</span>
            <div class="text-2xl font-bold text-slate-900 mt-1">{{ reporter.submittedTicketsCount ?? 0 }}</div>
            <span class="text-[11px] text-slate-500">All submitted issues</span>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span class="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">New</span>
            <div class="text-2xl font-bold text-blue-600 mt-1">{{ reporter.newTicketsCount ?? 0 }}</div>
            <span class="text-[11px] text-blue-500">Awaiting dispatch</span>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span class="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">In Progress</span>
            <div class="text-2xl font-bold text-sky-600 mt-1">
              {{ (reporter.assignedTicketsCount || 0) + (reporter.inProgressTicketsCount || 0) }}
            </div>
            <span class="text-[11px] text-sky-500">Currently being addressed</span>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span class="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">Resolved</span>
            <div class="text-2xl font-bold text-emerald-600 mt-1">{{ reporter.resolvedTicketsCount ?? 0 }}</div>
            <span class="text-[11px] text-emerald-500">Work completed</span>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Profile Card -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 h-fit">
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider m-0 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Account Information</span>
            </h2>

            <div class="space-y-3 text-xs">
              <div>
                <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Full Name</span>
                <span class="text-slate-800 font-medium text-sm">{{ reporter.name }}</span>
              </div>

              <div>
                <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Email Address</span>
                <a [href]="'mailto:' + reporter.email" class="text-primary font-medium hover:underline block truncate">
                  {{ reporter.email }}
                </a>
              </div>

              <div>
                <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Phone Number</span>
                <span class="text-slate-800 font-medium">{{ reporter.phone || 'Not provided' }}</span>
              </div>

              <div>
                <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Department</span>
                <span class="text-slate-800 font-medium">{{ reporter.department || 'Not specified' }}</span>
              </div>

              <div>
                <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Registration Date</span>
                <span class="text-slate-800 font-medium">{{ reporter.createdAt | date:'longDate' }}</span>
              </div>

              <div>
                <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Last Profile Update</span>
                <span class="text-slate-800 font-medium">
                  {{ reporter.updatedAt ? (reporter.updatedAt | date:'medium') : (reporter.createdAt | date:'medium') }}
                </span>
              </div>
            </div>

            <!-- Account Status Selector -->
            <div class="pt-4 border-t border-slate-100 space-y-2">
              <span class="text-xs font-bold text-slate-900 block">Change Status</span>
              <div class="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  (click)="changeStatus('ACTIVE')"
                  [disabled]="reporter.status === 'ACTIVE'"
                  class="py-1.5 px-2 text-xs font-semibold rounded transition-all cursor-pointer text-center"
                  [ngClass]="reporter.status === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
                >
                  Active
                </button>
                <button
                  type="button"
                  (click)="changeStatus('SUSPENDED')"
                  [disabled]="reporter.status === 'SUSPENDED'"
                  class="py-1.5 px-2 text-xs font-semibold rounded transition-all cursor-pointer text-center"
                  [ngClass]="reporter.status === 'SUSPENDED' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
                >
                  Suspend
                </button>
                <button
                  type="button"
                  (click)="changeStatus('DEACTIVATED')"
                  [disabled]="reporter.status === 'DEACTIVATED'"
                  class="py-1.5 px-2 text-xs font-semibold rounded transition-all cursor-pointer text-center"
                  [ngClass]="reporter.status === 'DEACTIVATED' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>

          <!-- Submitted Tickets Table / List -->
          <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                <span>Reported Issues & Work Orders</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {{ (reporter.tickets || []).length }}
                </span>
              </h2>
            </div>

            <div class="space-y-3">
              @for (ticket of (reporter.tickets || []); track ticket.id) {
                <a
                  [routerLink]="['/admin/tickets', ticket.id]"
                  class="p-4 rounded-xl border border-slate-200 hover:border-primary/60 hover:bg-blue-50/20 block transition-all group shadow-2xs"
                >
                  <div class="flex items-center justify-between gap-2 mb-1.5">
                    <span class="font-mono text-xs font-bold text-primary group-hover:underline">
                      #{{ ticket.id ? ticket.id.substring(0, 8) : '' }}
                    </span>
                    <div class="flex items-center gap-1.5">
                      <app-status-badge [priority]="ticket.priority"></app-status-badge>
                      <app-status-badge [status]="ticket.status"></app-status-badge>
                    </div>
                  </div>

                  <h3 class="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors m-0">
                    {{ ticket.title || ('Issue #' + (ticket.id ? ticket.id.substring(0, 8) : '')) }}
                  </h3>

                  <div class="text-xs text-slate-500 mt-2 flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm text-slate-400">location_on</span>
                      <span>{{ ticket.building || 'Campus Facility' }} @if (ticket.room) { • Room {{ ticket.room }} } @if (ticket.floor) { (Floor {{ ticket.floor }}) }</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <span class="material-symbols-outlined text-sm">calendar_today</span>
                      <span>{{ ticket.createdAt | date:'mediumDate' }}</span>
                    </div>
                  </div>
                </a>
              } @empty {
                <div class="py-12 text-center bg-slate-50/50 rounded-xl border border-slate-100 space-y-2">
                  <span class="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
                  <p class="text-xs font-semibold text-slate-700 m-0">No work orders recorded for this user.</p>
                  <p class="text-[11px] text-slate-400 m-0">Issues submitted by this reporter will appear here.</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ReporterDetailComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reporterService = inject(ReporterService);
  private notificationStore = inject(NotificationStore);
  private dialog = inject(MatDialog);

  public reporter: ReporterDetail | null = null;
  public isLoading = true;
  public error: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadReporter(id);
      } else {
        this.isLoading = false;
        this.error = 'Invalid reporter identifier.';
        this.cdr.markForCheck();
      }
    });
  }

  loadReporter(id: string): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.reporterService.getReporterById(id).subscribe({
      next: (data) => {
        this.reporter = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || err.error?.Message || 'Could not find reporter account.';
        this.cdr.markForCheck();
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'R';
    return name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  }

  changeStatus(newStatus: ReporterStatus): void {
    if (!this.reporter || this.reporter.status === newStatus) return;

    this.reporterService.updateStatus(this.reporter.id, newStatus).subscribe({
      next: (updated) => {
        if (this.reporter) {
          this.reporter.status = updated.status;
          this.reporter.isActive = updated.isActive;
        }
        this.notificationStore.showToast({
          type: 'success',
          message: `Account status updated to ${newStatus}.`
        });
      },
      error: (err) => {
        this.notificationStore.showToast({
          type: 'error',
          message: err.error?.message || err.error?.Message || 'Failed to update status.'
        });
      }
    });
  }

  openEdit(): void {
    if (!this.reporter) return;

    const dialogRef = this.dialog.open(ReporterFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { reporter: this.reporter }
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (updated && this.reporter) {
        this.loadReporter(this.reporter.id);
      }
    });
  }

  openDelete(): void {
    if (!this.reporter) return;

    const dialogRef = this.dialog.open(ReporterDeleteDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { reporter: this.reporter }
    });

    dialogRef.afterClosed().subscribe((deleted) => {
      if (deleted) {
        this.router.navigate(['/admin/reporters']);
      }
    });
  }
}

