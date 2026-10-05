import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly toastsSignal = signal<ToastMessage[]>([]);
  public readonly toasts = this.toastsSignal.asReadonly();

  public show(type: ToastType, title: string, message?: string, duration = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, title, message, duration };
    this.toastsSignal.update((toasts) => [...toasts, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  public success(title: string, message?: string): void {
    this.show('success', title, message);
  }

  public error(title: string, message?: string): void {
    this.show('error', title, message, 6000);
  }

  public warning(title: string, message?: string): void {
    this.show('warning', title, message);
  }

  public info(title: string, message?: string): void {
    this.show('info', title, message);
  }

  public dismiss(id: string): void {
    this.toastsSignal.update((toasts) => toasts.filter((t) => t.id !== id));
  }
}
