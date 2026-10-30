import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Ticket } from '../../models/ticket.model';

export interface StartWorkDialogData {
  ticket?: Ticket;
  ticketId?: string;
  ticketNumber?: string;
  title?: string;
  building?: string;
  room?: string;
  priority?: string;
  message?: string;
}

@Component({
  selector: 'app-start-work-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div mat-dialog-title class="!flex !items-start !justify-between !m-0 p-5 pb-3 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-50 text-[#1E3A8A] flex items-center justify-center border border-blue-100 shadow-2xs shrink-0">
          <span class="material-symbols-outlined text-[24px]">play_circle</span>
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900 leading-tight m-0">Start Work on Ticket</h2>
          <p class="text-xs text-slate-500 font-normal m-0 mt-0.5">Technician Dispatch &amp; Work Order Activation</p>
        </div>
      </div>
      <button
        mat-dialog-close
        type="button"
        class="text-slate-400 hover:text-slate-600 border-0 bg-transparent p-1 cursor-pointer rounded-md hover:bg-slate-100 transition-colors"
        aria-label="Close dialog"
      >
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <mat-dialog-content class="!p-5 space-y-4">
      @if (ticket) {
        <div class="bg-slate-50 border border-slate-200/90 rounded-lg p-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-900 text-xs">
              Ticket #{{ ticket.ticketNumber || ticket.id }}
            </span>
            @if (ticket.priority) {
              <span
                class="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider"
                [ngClass]="priorityBadgeClass"
              >
                {{ ticket.priority }}
              </span>
            }
          </div>
          <div class="text-sm font-semibold text-slate-800 line-clamp-2">
            {{ ticket.title }}
          </div>
          @if (ticket.building || ticket.room) {
            <div class="text-xs text-slate-500 flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
              <span class="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
              <span>
                {{ ticket.building }}{{ ticket.room ? ' • Room ' + ticket.room : '' }}
              </span>
            </div>
          }
        </div>
      }

      <p class="text-sm text-slate-600 leading-relaxed m-0">
        {{ displayMessage }}
      </p>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="border-t border-slate-100 p-4 gap-2.5">
      <button mat-button mat-dialog-close class="!px-4 text-slate-700 font-medium">
        Cancel
      </button>
      <button
        mat-flat-button
        color="primary"
        (click)="confirm()"
        class="!bg-[#1E3A8A] hover:!bg-[#1D4ED8] !text-white !px-4 font-semibold flex items-center gap-1.5 shadow-xs"
      >
        <span class="material-symbols-outlined text-[18px]">play_arrow</span>
        <span>Yes, Start Work</span>
      </button>
    </mat-dialog-actions>
  `
})
export class StartWorkDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<StartWorkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StartWorkDialogData
  ) {}

  get ticket(): Partial<Ticket> | undefined {
    if (this.data?.ticket) return this.data.ticket;
    if (this.data?.ticketId || this.data?.title) {
      return {
        id: this.data.ticketId,
        ticketNumber: this.data.ticketNumber || this.data.ticketId,
        title: this.data.title || '',
        building: this.data.building || '',
        room: this.data.room || '',
        priority: (this.data.priority as any) || undefined
      };
    }
    return undefined;
  }

  get displayMessage(): string {
    if (this.data?.message) return this.data.message;
    return 'Are you ready to mark this ticket as IN PROGRESS? This documents that you are actively on site and working on resolution.';
  }

  get priorityBadgeClass(): string {
    const p = this.ticket?.priority;
    switch (p) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'LOW':
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
