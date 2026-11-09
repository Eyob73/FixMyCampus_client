import { Component, Inject, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { StatusBadgeComponent } from '../../../../ui/badge/status-badge.component';
import { ReporterStore } from '../../../../store/reporter.store';
import { ReporterService } from '../../../../services/reporter.service';
import { NotificationStore } from '../../../../store/notification.store';
import { Reporter, ReporterStatus, ReporterDetail, ReporterTicketSummary } from '../../../../models';
import { ReporterFormDialogComponent } from '../reporter-form-dialog/reporter-form-dialog.component';
import { ReporterDeleteDialogComponent } from '../reporter-delete-dialog/reporter-delete-dialog.component';

export interface ReporterDetailDialogData {
  reporter: Reporter;
  tickets?: any[];
}

@Component({
  selector: 'app-reporter-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatButtonModule,
    StatusBadgeComponent
  ],
  template: `
    <div class="flex items-center justify-between p-5 pb-3 border-b border-slate-100">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-full bg-blue-50 text-primary border border-blue-100 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-xl">person</span>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h2 mat-dialog-title class="!m-0 text-base font-bold text-slate-900 truncate">{{ reporter().name }}</h2>
            <app-status-badge [status]="reporter().status"></app-status-badge>
          </div>
          <p class="text-xs text-slate-500 m-0 mt-0.5 truncate">{{ reporter().department || 'General' }} • {{ reporter().role }}</p>
        </div>
      </div>
      <button
        mat-dialog-close
        type="button"
        class="text-slate-400 hover:text-slate-600 border-0 bg-transparent p-1.5 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Close dialog"
      >
        <span class="material-symbols-outlined text-xl">close</span>
      </button>
    </div>

    <mat-dialog-content class="!p-5 space-y-4">
      <!-- Contact & Account Details Grid -->
      <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
        <div>
          <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Email</span>
          <a [href]="'mailto:' + reporter().email" class="text-slate-800 font-medium hover:text-primary transition-colors truncate block">
            {{ reporter().email }}
          </a>
        </div>
        <div>
          <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Phone</span>
          <span class="text-slate-800 font-medium block">
            {{ reporter().phone || 'Not provided' }}
          </span>
        </div>
        <div>
          <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Member Since</span>
          <span class="text-slate-800 font-medium">{{ reporter().createdAt | date:'mediumDate' }}</span>
        </div>
        <div>
          <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Last Activity</span>
          <span class="text-slate-800 font-medium">
            {{ reporter().lastActiveAt ? (reporter().lastActiveAt | date:'short') : (reporter().createdAt | date:'short') }}
          </span>
        </div>
      </div>

      <!-- Issue Breakdown Stats -->
      <div class="grid grid-cols-4 gap-2 text-center text-xs">
        <div class="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
          <span class="text-slate-500 text-[10px] uppercase font-bold block">New</span>
          <span class="text-sm font-bold text-blue-700">{{ detailedInfo()?.newTicketsCount ?? 0 }}</span>
        </div>
        <div class="p-2.5 rounded-lg bg-sky-50/60 border border-sky-100">
          <span class="text-slate-500 text-[10px] uppercase font-bold block">In Progress</span>
          <span class="text-sm font-bold text-sky-700">
            {{ (detailedInfo()?.assignedTicketsCount ?? 0) + (detailedInfo()?.inProgressTicketsCount ?? 0) }}
          </span>
        </div>
        <div class="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
          <span class="text-slate-500 text-[10px] uppercase font-bold block">Resolved</span>
          <span class="text-sm font-bold text-emerald-700">{{ detailedInfo()?.resolvedTicketsCount ?? 0 }}</span>
        </div>
        <div class="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
          <span class="text-slate-500 text-[10px] uppercase font-bold block">Total</span>
          <span class="text-sm font-bold text-slate-800">
            {{ detailedInfo()?.submittedTicketsCount ?? reporter().submittedTicketsCount ?? tickets().length }}
          </span>
        </div>
      </div>

      <!-- Status Management Action Bar -->
      <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span class="font-semibold text-slate-700">Account Status:</span>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            (click)="changeStatus('ACTIVE')"
            [disabled]="reporter().status === 'ACTIVE'"
            class="px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer"
            [ngClass]="reporter().status === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'"
          >
            Active
          </button>
          <button
            type="button"
            (click)="changeStatus('SUSPENDED')"
            [disabled]="reporter().status === 'SUSPENDED'"
            class="px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer"
            [ngClass]="reporter().status === 'SUSPENDED' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'"
          >
            Suspended
          </button>
          <button
            type="button"
            (click)="changeStatus('DEACTIVATED')"
            [disabled]="reporter().status === 'DEACTIVATED'"
            class="px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer"
            [ngClass]="reporter().status === 'DEACTIVATED' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'"
          >
            Deactivated
          </button>
        </div>
      </div>

      <!-- Submission History Section -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
            Reported Tickets & Work Orders
          </h3>
          <span class="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-full">
            {{ detailedInfo()?.submittedTicketsCount ?? reporter().submittedTicketsCount ?? tickets().length }}
          </span>
        </div>

        @if (isLoadingTickets()) {
          <div class="flex items-center justify-center py-6 bg-slate-50 border border-slate-200 rounded-lg">
            <span class="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
            <span class="ml-2 text-xs text-slate-500">Loading work orders...</span>
          </div>
        } @else {
          <div class="max-h-60 overflow-y-auto space-y-2 pr-1">
            @for (ticket of tickets(); track ticket.id) {
              <a
                [routerLink]="['/admin/tickets', ticket.id]"
                (click)="dialogRef.close()"
                class="p-3 rounded-lg border border-slate-200 hover:border-primary/60 hover:bg-blue-50/20 block transition-all group"
              >
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="font-mono font-bold text-primary group-hover:underline">
                    #{{ ticket.id ? ticket.id.substring(0, 8) : '' }}
                  </span>
                  <app-status-badge [status]="ticket.status"></app-status-badge>
                </div>
                <div class="font-semibold text-slate-800 text-xs line-clamp-1 group-hover:text-primary transition-colors">
                  {{ ticket.title || ('Issue #' + (ticket.id ? ticket.id.substring(0, 8) : '')) }}
                </div>
                <div class="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{{ ticket.category || 'General' }} • {{ ticket.building || 'Campus' }} @if (ticket.room) { (Room {{ ticket.room }}) }</span>
                  <span>{{ ticket.createdAt | date:'shortDate' }}</span>
                </div>
              </a>
            } @empty {
              <div class="py-8 text-center bg-slate-50/60 rounded-lg border border-slate-100 space-y-1.5">
                <span class="material-symbols-outlined text-3xl text-slate-300">receipt_long</span>
                <p class="text-xs font-medium text-slate-600 m-0">No work orders recorded for this user.</p>
              </div>
            }
          </div>
        }
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!px-5 !py-3 border-t border-slate-100 !m-0 !flex !items-center !justify-between">
      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="openEdit()"
          class="px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-blue-50 border border-blue-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span class="material-symbols-outlined text-sm">edit</span>
          <span>Edit Profile</span>
        </button>

        <button
          type="button"
          (click)="openDelete()"
          class="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span class="material-symbols-outlined text-sm">delete</span>
          <span>Delete Account</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="navigateToFullPage()"
          class="px-2.5 py-1.5 text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View Full Profile</span>
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </button>

        <button
          mat-button
          mat-dialog-close
          type="button"
          class="text-xs font-semibold !text-slate-700 hover:!bg-slate-100 cursor-pointer"
        >
          Close
        </button>
      </div>
    </mat-dialog-actions>
  `
})
export class ReporterDetailDialogComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private reporterStore = inject(ReporterStore);
  private reporterService = inject(ReporterService);
  private notificationStore = inject(NotificationStore);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  public readonly reporter = signal<Reporter>({} as Reporter);
  public readonly tickets = signal<any[]>([]);
  public readonly detailedInfo = signal<ReporterDetail | null>(null);
  public readonly isLoadingTickets = signal<boolean>(true);

  constructor(
    public dialogRef: MatDialogRef<ReporterDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReporterDetailDialogData
  ) {
    this.reporter.set({ ...data.reporter });
    this.tickets.set(data.tickets || []);
  }

  ngOnInit(): void {
    this.fetchDetail();
  }

  fetchDetail(): void {
    const current = this.reporter();
    if (!current?.id) {
      this.isLoadingTickets.set(false);
      this.cdr.markForCheck();
      return;
    }

    this.isLoadingTickets.set(true);
    this.reporterService.getReporterById(current.id).subscribe({
      next: (detail) => {
        if (detail) {
          this.detailedInfo.set(detail);
          this.reporter.set({ ...current, ...detail });
          this.tickets.set(detail.tickets || []);
        }
        this.isLoadingTickets.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingTickets.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  navigateToFullPage(): void {
    this.dialogRef.close();
    this.router.navigate(['/admin/reporters', this.reporter().id]);
  }

  changeStatus(newStatus: ReporterStatus): void {
    const current = this.reporter();
    if (current.status === newStatus) return;

    this.reporterService.updateStatus(current.id, newStatus).subscribe({
      next: (updated) => {
        this.reporter.set({ ...current, status: updated.status, isActive: updated.isActive });
        this.reporterStore.loadReporters();
        this.cdr.markForCheck();
        this.notificationStore.showToast({
          type: 'success',
          message: `${current.name} status set to ${newStatus}.`
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

  openEdit(): void {
    const dialogRef = this.dialog.open(ReporterFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { reporter: this.reporter() }
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (updated) {
        this.reporter.set({ ...this.reporter(), ...updated });
        this.reporterStore.loadReporters();
        this.cdr.markForCheck();
      }
    });
  }

  openDelete(): void {
    const dialogRef = this.dialog.open(ReporterDeleteDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { reporter: this.reporter() }
    });

    dialogRef.afterClosed().subscribe((deleted) => {
      if (deleted) {
        this.reporterStore.loadReporters();
        this.dialogRef.close();
      }
    });
  }
}
