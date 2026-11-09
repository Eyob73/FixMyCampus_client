import { Component, Inject, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { StatusBadgeComponent } from '../../../../ui/badge/status-badge.component';
import { TechnicianStore } from '../../../../store/technician.store';
import { TechnicianService } from '../../../../services/technician.service';
import { NotificationStore } from '../../../../store/notification.store';
import { Technician, TechnicianStatus, TechnicianDetail } from '../../../../models';
import { TechnicianFormDialogComponent } from '../technician-form-dialog/technician-form-dialog.component';
import { TechnicianDeleteDialogComponent } from '../technician-delete-dialog/technician-delete-dialog.component';

export interface TechnicianDetailDialogData {
  technician: Technician;
  tickets?: any[];
}

@Component({
  selector: 'app-technician-detail-dialog',
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
          <span class="material-symbols-outlined text-xl">engineering</span>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h2 mat-dialog-title class="!m-0 text-base font-bold text-slate-900 truncate">{{ technician().name }}</h2>
            <app-status-badge [status]="technician().status"></app-status-badge>
          </div>
          <p class="text-xs text-slate-500 m-0 mt-0.5 truncate">{{ technician().department }} • {{ technician().specialty }}</p>
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
          <a [href]="'mailto:' + technician().email" class="text-slate-800 font-medium hover:text-primary transition-colors truncate block">
            {{ technician().email }}
          </a>
        </div>
        <div>
          <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Phone</span>
          <span class="text-slate-800 font-medium block">
            {{ technician().phone || 'Not provided' }}
          </span>
        </div>
        <div>
          <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Staff Rating</span>
          <span class="text-amber-600 font-bold flex items-center gap-1">
            ★ {{ technician().rating || 5.0 }} / 5.0
          </span>
        </div>
        <div>
          <span class="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Joined Roster</span>
          <span class="text-slate-800 font-medium">
            {{ technician().createdAt | date:'mediumDate' }}
          </span>
        </div>
      </div>

      <!-- Issue Breakdown Stats -->
      <div class="grid grid-cols-3 gap-2 text-center text-xs">
        <div class="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
          <span class="text-slate-500 text-[10px] uppercase font-bold block">Active Orders</span>
          <span class="text-sm font-bold text-blue-700">{{ technician().activeTicketsCount ?? 0 }}</span>
        </div>
        <div class="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
          <span class="text-slate-500 text-[10px] uppercase font-bold block">Resolved</span>
          <span class="text-sm font-bold text-emerald-700">{{ technician().resolvedTicketsCount ?? 0 }}</span>
        </div>
        <div class="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
          <span class="text-slate-500 text-[10px] uppercase font-bold block">Total Assigned</span>
          <span class="text-sm font-bold text-slate-800">{{ technician().assignedTicketCount ?? 0 }}</span>
        </div>
      </div>

      <!-- Assigned Tickets Section -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
            Assigned Work Orders ({{ assignedTickets().length }})
          </h3>
          <span class="text-[11px] text-slate-500">Most recent</span>
        </div>

        @if (isLoadingTickets()) {
          <div class="flex items-center justify-center py-6 bg-slate-50 border border-slate-200 rounded-lg">
            <span class="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
            <span class="ml-2 text-xs text-slate-500">Loading work orders...</span>
          </div>
        } @else if (assignedTickets().length === 0) {
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
            No tickets currently assigned to this technician.
          </div>
        } @else {
          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            @for (ticket of assignedTickets(); track ticket.id) {
              <div
                (click)="navigateToTicket(ticket.id)"
                class="p-2.5 bg-white border border-slate-200 hover:border-primary/50 hover:bg-slate-50/60 rounded-lg transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div class="min-w-0">
                  <div class="font-semibold text-slate-900 hover:text-primary truncate">
                    {{ ticket.title || ('Work Order #' + (ticket.id ? ticket.id.substring(0, 8) : '')) }}
                  </div>
                  <div class="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{{ ticket.building || 'Campus Facility' }}{{ ticket.room ? ' - ' + ticket.room : '' }}</span>
                    <span>•</span>
                    <span>{{ ticket.createdAt | date:'shortDate' }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                    [ngClass]="getPriorityClasses(ticket.priority)"
                  >
                    {{ ticket.priority }}
                  </span>
                  <app-status-badge [status]="ticket.status"></app-status-badge>
                </div>
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
          class="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span class="material-symbols-outlined text-sm">edit</span>
          <span>Edit Profile</span>
        </button>

        <button
          type="button"
          (click)="openDelete()"
          class="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-300 rounded hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span class="material-symbols-outlined text-sm">delete</span>
          <span>Delete Account</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="navigateToFullPage()"
          class="px-3 py-1.5 text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View Full Profile</span>
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </button>

        <button
          mat-button
          mat-dialog-close
          type="button"
          class="text-xs font-semibold !text-slate-600 hover:!bg-slate-100 cursor-pointer"
        >
          Close
        </button>
      </div>
    </mat-dialog-actions>
  `
})
export class TechnicianDetailDialogComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private technicianService = inject(TechnicianService);
  private technicianStore = inject(TechnicianStore);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  public dialogRef = inject(MatDialogRef<TechnicianDetailDialogComponent>);

  public readonly technician = signal<Technician>({} as Technician);
  public readonly assignedTickets = signal<any[]>([]);
  public readonly isLoadingTickets = signal<boolean>(true);

  constructor(@Inject(MAT_DIALOG_DATA) public data: TechnicianDetailDialogData) {
    this.technician.set({ ...data.technician });
    if (data.tickets) {
      this.assignedTickets.set(data.tickets);
    }
  }

  ngOnInit(): void {
    this.loadFullDetail();
  }

  private loadFullDetail(): void {
    const current = this.technician();
    if (!current?.id) {
      this.isLoadingTickets.set(false);
      this.cdr.markForCheck();
      return;
    }

    this.isLoadingTickets.set(true);
    this.technicianService.getTechnicianById(current.id).subscribe({
      next: (detail) => {
        if (detail) {
          this.technician.set({ ...current, ...detail });
          this.assignedTickets.set(detail.assignedTickets || []);
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

  navigateToTicket(ticketId: string): void {
    this.dialogRef.close();
    this.router.navigate(['/admin/tickets', ticketId]);
  }

  navigateToFullPage(): void {
    this.dialogRef.close();
    this.router.navigate(['/admin/technicians', this.technician().id]);
  }

  openEdit(): void {
    const editRef = this.dialog.open(TechnicianFormDialogComponent, {
      width: '540px',
      maxWidth: '95vw',
      data: { technician: this.technician() }
    });

    editRef.afterClosed().subscribe((updated) => {
      if (updated) {
        this.technician.set({ ...this.technician(), ...updated });
        this.technicianStore.loadTechnicians();
        this.cdr.markForCheck();
      }
    });
  }

  openDelete(): void {
    const dialogRef = this.dialog.open(TechnicianDeleteDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { technician: this.technician() }
    });

    dialogRef.afterClosed().subscribe((deleted) => {
      if (deleted) {
        this.technicianStore.loadTechnicians();
        this.dialogRef.close();
      }
    });
  }
}

