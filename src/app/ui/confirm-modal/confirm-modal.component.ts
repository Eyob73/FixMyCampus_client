import { Component, EventEmitter, Input, Output, ViewChild, TemplateRef, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <ng-template #dialogTemplate>
      <h2 mat-dialog-title class="flex items-center gap-2 m-0 pb-2">
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
             [ngClass]="isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'">
          <span class="material-symbols-outlined text-xl">
            {{ isDanger ? 'warning' : 'help' }}
          </span>
        </div>
        <div>
          <div class="text-base font-bold text-slate-900 leading-tight">{{ title }}</div>
          <div class="text-xs text-slate-500 font-normal">Please confirm your action</div>
        </div>
      </h2>
      <mat-dialog-content>
        <p class="text-sm text-slate-600 leading-relaxed pt-2">{{ message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="border-t border-slate-100 mt-2 p-4">
        <button mat-button (click)="onCancel()" class="text-slate-700 font-medium">
          {{ cancelText }}
        </button>
        <button mat-flat-button [color]="isDanger ? 'warn' : 'primary'" (click)="onConfirm()">
          {{ confirmText }}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `
})
export class ConfirmModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed with this action?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() isDanger = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  private dialog = inject(MatDialog);
  private dialogRef: MatDialogRef<any> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen && !this.dialogRef) {
        setTimeout(() => {
          this.dialogRef = this.dialog.open(this.dialogTemplate, {
            width: '450px',
            disableClose: true,
            panelClass: 'custom-dialog-container'
          });
        });
      } else if (!this.isOpen && this.dialogRef) {
        this.dialogRef.close();
        this.dialogRef = null;
      }
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
