import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ResolveTicketDialogData {
  ticketId: string;
  ticketNumber?: string;
  ticketTitle?: string;
  initialDescription?: string;
  initialWorkPerformed?: string;
  initialMaterialsUsed?: string;
  initialAdditionalNotes?: string;
}

export interface ResolveTicketDialogResult {
  resolutionDescription: string;
  workPerformed: string;
  materialsUsed?: string;
  additionalNotes?: string;
}

@Component({
  selector: 'app-resolve-ticket-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  template: `
    <div mat-dialog-title class="!flex !items-start !justify-between !m-0 p-5 pb-3 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs shrink-0">
          <span class="material-symbols-outlined text-[24px]">verified</span>
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900 leading-tight m-0">Close Out &amp; Resolve Work Order</h2>
          <p class="text-xs text-slate-500 font-normal m-0 mt-0.5">
            Document resolution for Ticket #{{ data.ticketNumber || data.ticketId }}
          </p>
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
      <p class="text-xs text-slate-500 m-0">
        Please document the resolution before marking this ticket as completed. Required fields are marked with *.
      </p>

      @if (hasError) {
        <div class="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm">warning</span>
          <span>Please fill in both the Resolution Summary and Work Performed.</span>
        </div>
      }

      <!-- Resolution Summary (Required) -->
      <div class="space-y-1">
        <label class="block text-xs font-semibold text-slate-800" for="resolutionSummary">
          Resolution Summary <span class="text-red-500">*</span>
        </label>
        <input
          id="resolutionSummary"
          type="text"
          [(ngModel)]="form.description"
          placeholder="e.g. Diagnosed ballast short circuit and installed new power module."
          class="w-full h-[38px] px-3 bg-white border rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-colors"
          [ngClass]="{ 'border-red-400 bg-red-50/20': hasError && !form.description.trim(), 'border-slate-300': !hasError || form.description.trim() }"
        />
      </div>

      <!-- Work Performed (Required) -->
      <div class="space-y-1">
        <label class="block text-xs font-semibold text-slate-800" for="workPerformed">
          Work Performed <span class="text-red-500">*</span>
        </label>
        <textarea
          id="workPerformed"
          [(ngModel)]="form.workPerformed"
          rows="3"
          placeholder="Detail the steps taken, adjustments made, and test procedures executed..."
          class="w-full p-2.5 bg-white border rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-colors"
          [ngClass]="{ 'border-red-400 bg-red-50/20': hasError && !form.workPerformed.trim(), 'border-slate-300': !hasError || form.workPerformed.trim() }"
        ></textarea>
      </div>

      <!-- Materials Used (Optional) -->
      <div class="space-y-1">
        <label class="block text-xs font-semibold text-slate-800" for="materialsUsed">
          Materials / Parts Replaced <span class="text-slate-400 font-normal">(Optional)</span>
        </label>
        <input
          id="materialsUsed"
          type="text"
          [(ngModel)]="form.materialsUsed"
          placeholder="e.g. 1x HDMI Balun #EX-300, 2x Wire Nuts, 10ft Cat6 Cable"
          class="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-colors"
        />
      </div>

      <!-- Additional Notes (Optional) -->
      <div class="space-y-1">
        <label class="block text-xs font-semibold text-slate-800" for="additionalNotes">
          Additional Inspection Notes <span class="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          id="additionalNotes"
          [(ngModel)]="form.additionalNotes"
          rows="2"
          placeholder="Follow-up recommendations or future preventative maintenance notice..."
          class="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-colors"
        ></textarea>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="border-t border-slate-100 p-4 gap-2.5">
      <button mat-button mat-dialog-close class="!px-4 text-slate-700 font-medium">
        Cancel
      </button>
      <button
        mat-flat-button
        (click)="submit()"
        class="!bg-[#10B981] hover:!bg-[#059669] !text-white !px-4 font-semibold flex items-center gap-1.5 shadow-xs"
      >
        <span class="material-symbols-outlined text-[18px]">task_alt</span>
        <span>Submit Resolution &amp; Complete Ticket</span>
      </button>
    </mat-dialog-actions>
  `
})
export class ResolveTicketDialogComponent {
  form = {
    description: '',
    workPerformed: '',
    materialsUsed: '',
    additionalNotes: '',
  };
  hasError = false;

  constructor(
    public dialogRef: MatDialogRef<ResolveTicketDialogComponent, ResolveTicketDialogResult | null>,
    @Inject(MAT_DIALOG_DATA) public data: ResolveTicketDialogData
  ) {
    if (data) {
      this.form.description = data.initialDescription || '';
      this.form.workPerformed = data.initialWorkPerformed || '';
      this.form.materialsUsed = data.initialMaterialsUsed || '';
      this.form.additionalNotes = data.initialAdditionalNotes || '';
    }
  }

  submit(): void {
    if (!this.form.description.trim() || !this.form.workPerformed.trim()) {
      this.hasError = true;
      return;
    }

    this.hasError = false;
    this.dialogRef.close({
      resolutionDescription: this.form.description.trim(),
      workPerformed: this.form.workPerformed.trim(),
      materialsUsed: this.form.materialsUsed.trim() || undefined,
      additionalNotes: this.form.additionalNotes.trim() || undefined,
    });
  }
}
