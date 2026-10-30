import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { StatusBadgeComponent } from '../../../../ui/badge/status-badge.component';
import { ReporterStore } from '../../../../store/reporter.store';
import { NotificationStore } from '../../../../store/notification.store';
import { Reporter, ReporterStatus, Ticket } from '../../../../models';

export interface ReporterDetailDialogData {
  reporter: Reporter;
  tickets: Ticket[];
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
            <h2 mat-dialog-title class="!m-0 text-base font-bold text-slate-900 truncate">{{ reporter.name }}</h2>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border"
              [ngClass]="reporter.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'"
            >
              {{ reporter.status }}
            </span>
          </div>
          <p class="text-xs text-slate-500 m-0 mt-0.5 truncate">{{ reporter.department }} • {{ reporter.role }}</p>
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
          <a [href]="'mailto:' + reporter.email" class="text-slate-800 font-medium hover:text-primary transition-colors truncate block">
            {{ reporter.email }}
          </a>
        </div>
        <div>
          <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Phone</span>
          <a [href]="'tel:' + reporter.phone" class="text-slate-800 font-medium hover:text-primary transition-colors block">
            {{ reporter.phone || 'Not provided' }}
          </a>
        </div>
        <div>
          <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Member Since</span>
          <span class="text-slate-800 font-medium">{{ reporter.createdAt | date:'mediumDate' }}</span>
        </div>
        <div>
          <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Total Submissions</span>
          <span class="text-slate-800 font-medium font-mono">{{ tickets.length }} tickets</span>
        </div>
      </div>

      <!-- Submission History Section -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
            Ticket Submission History
          </h3>
          <span class="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-full">
            {{ tickets.length }}
          </span>
        </div>

        <div class="max-h-60 overflow-y-auto space-y-2 pr-1">
          @for (ticket of tickets; track ticket.id) {
            <a
              [routerLink]="['/admin/tickets', ticket.ticketNumber || ticket.id]"
              (click)="dialogRef.close()"
              class="p-3 rounded-lg border border-slate-200 hover:border-primary/60 hover:bg-blue-50/20 block transition-all group"
            >
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="font-mono font-bold text-primary group-hover:underline">
                  #{{ ticket.ticketNumber || ticket.id }}
                </span>
                <app-status-badge [status]="ticket.status"></app-status-badge>
              </div>
              <div class="font-semibold text-slate-800 text-xs line-clamp-1 group-hover:text-primary transition-colors">
                {{ ticket.title }}
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                <span>{{ ticket.building }} @if (ticket.room) { • Room {{ ticket.room }} }</span>
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
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!px-5 !py-3 border-t border-slate-100 !m-0 !flex !items-center !justify-between">
      <button
        type="button"
        (click)="toggleStatus()"
        class="text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
        [ngClass]="reporter.status === 'ACTIVE' ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'"
      >
        {{ reporter.status === 'ACTIVE' ? 'Deactivate Account' : 'Reactivate Account' }}
      </button>

      <button
        mat-button
        mat-dialog-close
        type="button"
        class="text-xs font-semibold !text-slate-700 hover:!bg-slate-100 cursor-pointer"
      >
        Close
      </button>
    </mat-dialog-actions>
  `
})
export class ReporterDetailDialogComponent {
  private reporterStore = inject(ReporterStore);
  private notificationStore = inject(NotificationStore);

  public reporter: Reporter;
  public tickets: Ticket[];

  constructor(
    public dialogRef: MatDialogRef<ReporterDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReporterDetailDialogData
  ) {
    this.reporter = { ...data.reporter };
    this.tickets = data.tickets || [];
  }

  toggleStatus(): void {
    const nextStatus: ReporterStatus = this.reporter.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.reporterStore.toggleReporterStatus({ id: this.reporter.id, newStatus: nextStatus });
    this.reporter = { ...this.reporter, status: nextStatus };
    this.notificationStore.showToast({
      type: 'success',
      message: `${this.reporter.name} status set to ${nextStatus}.`
    });
  }
}
