import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-200"
        (click)="onBackdropClick($event)"
      >
        <div
          class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 transform transition-all"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
        >
          <div class="flex items-start gap-3.5">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              [ngClass]="iconContainerClass"
            >
              <span class="material-symbols-outlined text-[22px]">{{ icon }}</span>
            </div>
            <div class="flex-1">
              <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
              <p class="text-sm text-slate-600 mt-1 leading-relaxed">{{ message }}</p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              (click)="cancel.emit()"
              [disabled]="loading"
              class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              (click)="confirm.emit()"
              [disabled]="loading"
              class="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              [ngClass]="confirmButtonClass"
            >
              @if (loading) {
                <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              }
              <span>{{ confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() variant: 'primary' | 'danger' | 'warning' = 'primary';
  @Input() loading: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get icon(): string {
    switch (this.variant) {
      case 'danger':
        return 'warning';
      case 'warning':
        return 'help';
      default:
        return 'check_circle';
    }
  }

  get iconContainerClass(): string {
    switch (this.variant) {
      case 'danger':
        return 'bg-red-50 text-red-600 border border-red-100';
      case 'warning':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      default:
        return 'bg-blue-50 text-[#1E3A8A] border border-blue-100';
    }
  }

  get confirmButtonClass(): string {
    switch (this.variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700';
      default:
        return 'bg-[#1E3A8A] hover:bg-[#1D4ED8]';
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (!this.loading) {
      this.cancel.emit();
    }
  }
}
