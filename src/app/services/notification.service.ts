import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { AppNotification } from '../models/notification.model';
import { environment } from '../../environments/environment';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

const NOTIF_STORAGE_KEY = 'fixmycampus_notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Toasts State
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  // Notifications State
  private notificationsSignal = signal<AppNotification[]>(this.loadInitial());
  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = computed(() =>
    this.notificationsSignal().filter((n) => !n.read).length
  );

  constructor(private http: HttpClient) {}

  // --- TOASTS LOGIC ---
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

  success(title: string, message?: string): string {
    return this.show({ type: 'success', title, message: message || '' });
  }

  error(title: string, message?: string): string {
    return this.show({ type: 'error', title, message: message || '', duration: 6000 });
  }

  info(title: string, message?: string): string {
    return this.show({ type: 'info', title, message: message || '' });
  }

  warning(title: string, message?: string): string {
    return this.show({ type: 'warning', title, message: message || '', duration: 5000 });
  }

  dismiss(id: string): void {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }

  // --- NOTIFICATIONS LOGIC ---
  private loadInitial(): AppNotification[] {
    try {
      const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load notifications from storage', e);
    }
    return [];
  }

  private persist(notifs: AppNotification[]): void {
    this.notificationsSignal.set(notifs);
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifs));
    } catch (e) {
      console.warn('Failed to save notifications', e);
    }
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${environment.apiUrl}/notifications`).pipe(
      tap((backendNotifs) => {
        if (Array.isArray(backendNotifs)) {
          this.persist(backendNotifs);
        }
      }),
      catchError(() => of(this.notificationsSignal()))
    );
  }

  markAsRead(id: string): Observable<void> {
    const updated = this.notificationsSignal().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.persist(updated);

    return this.http.patch<void>(`${environment.apiUrl}/notifications/${id}/read`, {}).pipe(
      catchError(() => of(void 0))
    );
  }

  markAllAsRead(): Observable<void> {
    const updated = this.notificationsSignal().map((n) => ({ ...n, read: true }));
    this.persist(updated);

    return this.http.post<void>(`${environment.apiUrl}/notifications/mark-all-read`, {}).pipe(
      catchError(() => of(void 0))
    );
  }

  addNotification(item: Omit<AppNotification, 'id' | 'createdAt'>): void {
    const newNotif: AppNotification = {
      ...item,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const current = [newNotif, ...this.notificationsSignal()];
    this.persist(current);
  }
}
