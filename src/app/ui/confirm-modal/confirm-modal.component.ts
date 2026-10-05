import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
        <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              [ngClass]="isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'"
            >
              <span class="material-symbols-outlined text-xl">
                {{ isDanger ? 'warning' : 'help' }}
              </span>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">{{ title }}</h3>
              <p class="text-xs text-slate-500 mt-0.5">Please confirm your action</p>
            </div>
          </div>

          <p class="text-sm text-slate-600 leading-relaxed">{{ message }}</p>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-slate-300 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              (click)="onConfirm()"
              class="px-4 py-2 text-sm font-semibold text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-offset-2 transition-colors"
              [ngClass]="isDanger ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-primary hover:bg-blue-800 focus:ring-primary'"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed with this action?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() isDanger = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
