import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all duration-300 animate-slide-up"
          [ngClass]="getToastClasses(toast)"
        >
          <span class="material-symbols-outlined shrink-0 text-xl" [ngClass]="getIconClass(toast)">
            {{ getIconName(toast) }}
          </span>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold tracking-tight">{{ toast.title }}</h4>
            @if (toast.message) {
              <p class="text-xs mt-0.5 opacity-90 leading-relaxed">{{ toast.message }}</p>
            }
          </div>
          <button
            type="button"
            (click)="notificationService.dismiss(toast.id)"
            class="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1 rounded"
          >
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-slide-up {
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ToastComponent {
  constructor(public notificationService: NotificationService) {}

  getToastClasses(toast: ToastMessage): string {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-950';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-950';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-950';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-950';
    }
  }

  getIconClass(toast: ToastMessage): string {
    switch (toast.type) {
      case 'success':
        return 'text-emerald-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-amber-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  }

  getIconName(toast: ToastMessage): string {
    switch (toast.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }
}
