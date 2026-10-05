import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../../services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      @for (toast of notificationService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border text-sm transition-all duration-200 transform translate-y-0"
          [ngClass]="getToastClasses(toast.type)"
          role="alert"
        >
          <span class="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
            {{ getToastIcon(toast.type) }}
          </span>
          <div class="flex-1 min-w-0">
            @if (toast.title) {
              <h4 class="font-semibold text-xs uppercase tracking-wider mb-0.5">{{ toast.title }}</h4>
            }
            <p class="text-sm leading-snug break-words">{{ toast.message }}</p>
          </div>
          <button
            type="button"
            (click)="notificationService.dismiss(toast.id)"
            class="text-current opacity-60 hover:opacity-100 transition-opacity p-0.5 rounded"
            aria-label="Dismiss notification"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly notificationService = inject(NotificationService);

  getToastIcon(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
    }
  }

  getToastClasses(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]';
      case 'error':
        return 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]';
      case 'warning':
        return 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]';
      case 'info':
        return 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]';
    }
  }
}
