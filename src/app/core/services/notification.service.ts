import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(toast: Omit<ToastMessage, 'id'>): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    };

    this._toasts.update((current) => [...current, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newToast.duration);
    }

    return id;
  }

  success(message: string, title: string = 'Success'): string {
    return this.show({ type: 'success', title, message });
  }

  error(message: string, title: string = 'Error'): string {
    return this.show({ type: 'error', title, message, duration: 6000 });
  }

  info(message: string, title: string = 'Notice'): string {
    return this.show({ type: 'info', title, message });
  }

  warning(message: string, title: string = 'Warning'): string {
    return this.show({ type: 'warning', title, message, duration: 5000 });
  }

  dismiss(id: string): void {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
