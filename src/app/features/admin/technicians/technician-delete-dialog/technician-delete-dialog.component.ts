import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TechnicianService } from '../../../../services/technician.service';
import { NotificationStore } from '../../../../store/notification.store';
import { Technician } from '../../../../models';

export interface TechnicianDeleteDialogData {
  technician: Technician;
}

@Component({
  selector: 'app-technician-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="flex items-center justify-between p-5 pb-3 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-xl">person_remove</span>
        </div>
        <div>
          <h2 mat-dialog-title class="!m-0 text-base font-bold text-slate-900">Delete Technician</h2>
          <p class="text-xs text-slate-500 m-0 mt-0.5">Confirm account deletion</p>
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

    <mat-dialog-content class="!p-5 space-y-3.5">
      @if (errorMessage) {
        <div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <span class="material-symbols-outlined text-base shrink-0">error</span>
          <span>{{ errorMessage }}</span>
        </div>
      }

      <p class="text-sm text-slate-700 leading-relaxed m-0">
        Are you sure you want to delete the account for
        <strong class="text-slate-900 font-semibold">{{ data.technician.name }}</strong>
        (<span class="font-mono text-slate-600">{{ data.technician.email }}</span>)?
      </p>

      <p class="text-xs text-slate-500 m-0">
        This will remove access for this technician account.
      </p>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!px-5 !py-3 border-t border-slate-100 !m-0 !flex !items-center !justify-end gap-2">
      <button
        mat-button
        mat-dialog-close
        type="button"
        [disabled]="isDeleting"
        class="text-xs font-semibold !text-slate-600 hover:!bg-slate-100 cursor-pointer"
      >
        Cancel
      </button>

      <button
        type="button"
        (click)="confirmDelete()"
        [disabled]="isDeleting"
        class="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-xs"
      >
        @if (isDeleting) {
          <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span>Deleting...</span>
        } @else {
          <span class="material-symbols-outlined text-sm">delete</span>
          <span>Delete Account</span>
        }
      </button>
    </mat-dialog-actions>
  `
})
export class TechnicianDeleteDialogComponent {
  private technicianService = inject(TechnicianService);
  private notificationStore = inject(NotificationStore);
  public dialogRef = inject(MatDialogRef<TechnicianDeleteDialogComponent>);

  public isDeleting = false;
  public errorMessage: string | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: TechnicianDeleteDialogData) {}

  confirmDelete(): void {
    if (this.isDeleting) return;

    this.isDeleting = true;
    this.errorMessage = null;

    this.technicianService.deleteTechnician(this.data.technician.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.notificationStore.showToast({
          type: 'success',
          message: `Technician ${this.data.technician.name} has been deleted.`
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isDeleting = false;
        this.errorMessage = err.error?.message || err.error?.Message || 'Failed to delete technician.';
      }
    });
  }
}

