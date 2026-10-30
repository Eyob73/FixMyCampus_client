import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  TemplateRef,
  inject,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <ng-template #dialogTemplate>
      <div mat-dialog-title class="!flex !items-start !justify-between !m-0 p-5 pb-2">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-2xs"
            [ngClass]="iconContainerClass"
          >
            <span class="material-symbols-outlined text-[22px]">{{ icon }}</span>
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 leading-tight m-0">{{ title }}</h2>
            <p class="text-xs text-slate-500 font-normal m-0 mt-0.5">Please confirm your action</p>
          </div>
        </div>
        <button
          mat-dialog-close
          type="button"
          (click)="onCancel()"
          class="text-slate-400 hover:text-slate-600 border-0 bg-transparent p-1 cursor-pointer rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <mat-dialog-content class="!px-5 !py-3">
        <p class="text-sm text-slate-600 leading-relaxed m-0">{{ message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="border-t border-slate-100 mt-2 px-5 py-4 gap-2.5">
        <button
          mat-button
          (click)="onCancel()"
          [disabled]="loading"
          class="!px-4 text-slate-700 font-medium"
        >
          {{ cancelText }}
        </button>
        <button
          mat-flat-button
          [disabled]="loading"
          (click)="onConfirm()"
          [color]="matButtonColor"
          class="!px-4 font-semibold flex items-center gap-1.5 shadow-xs"
          [ngClass]="confirmButtonClass"
        >
          @if (loading) {
            <span class="material-symbols-outlined text-sm animate-spin mr-1">progress_activity</span>
          }
          <span>{{ confirmText }}</span>
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
})
export class ConfirmModalComponent implements OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() variant: 'primary' | 'danger' | 'warning' = 'primary';
  @Input() isDanger: boolean = false;
  @Input() loading: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  private dialog = inject(MatDialog);
  private dialogRef: MatDialogRef<any> | null = null;

  get effectiveVariant(): 'primary' | 'danger' | 'warning' {
    if (this.isDanger) return 'danger';
    return this.variant;
  }

  get icon(): string {
    switch (this.effectiveVariant) {
      case 'danger':
        return 'warning';
      case 'warning':
        return 'help';
      default:
        return 'play_arrow';
    }
  }

  get iconContainerClass(): string {
    switch (this.effectiveVariant) {
      case 'danger':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'warning':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-blue-50 text-[#1E3A8A] border-blue-100';
    }
  }

  get matButtonColor(): 'primary' | 'warn' | undefined {
    if (this.effectiveVariant === 'danger') return 'warn';
    if (this.effectiveVariant === 'primary') return 'primary';
    return undefined;
  }

  get confirmButtonClass(): string {
    switch (this.effectiveVariant) {
      case 'danger':
        return '!bg-red-600 hover:!bg-red-700 !text-white';
      case 'warning':
        return '!bg-amber-600 hover:!bg-amber-700 !text-white';
      default:
        return '!bg-[#1E3A8A] hover:!bg-[#1D4ED8] !text-white';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen && !this.dialogRef) {
        setTimeout(() => {
          if (this.isOpen && !this.dialogRef && this.dialogTemplate) {
            this.dialogRef = this.dialog.open(this.dialogTemplate, {
              width: '460px',
              disableClose: this.loading,
              panelClass: 'custom-dialog-container'
            });

            this.dialogRef.afterClosed().subscribe(() => {
              this.dialogRef = null;
              if (this.isOpen) {
                this.cancel.emit();
              }
            });
          }
        });
      } else if (!this.isOpen && this.dialogRef) {
        this.dialogRef.close();
        this.dialogRef = null;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
    this.cancel.emit();
  }
}
