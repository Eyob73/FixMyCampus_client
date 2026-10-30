import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { NotificationService, ToastMessage } from '../services/notification.service';
import { AppNotification } from '../models/notification.model';
import { computed } from '@angular/core';

export interface NotificationState {
  toasts: ToastMessage[];
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  toasts: [],
  notifications: [],
  loading: false,
  error: null
};

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ notifications }) => ({
    unreadCount: computed(() => notifications().filter(n => !n.read && !n.isRead).length),
    recentNotifications: computed(() => notifications().slice(0, 5))
  })),
  withMethods((store, notificationService = inject(NotificationService)) => {
    return {
      loadNotifications: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => notificationService.getNotifications().pipe(
            tap((notifications) => {
              if (Array.isArray(notifications)) {
                patchState(store, { notifications, loading: false, error: null });
              } else {
                patchState(store, { loading: false });
              }
            }),
            catchError((err) => {
              patchState(store, { loading: false, error: 'Failed to load notifications' });
              return of(null);
            })
          ))
        )
      ),

      markAsRead: rxMethod<string>(
        pipe(
          switchMap((id) => notificationService.markAsRead(id).pipe(
            tap(() => {
              const updated = store.notifications().map(n =>
                n.id === id ? { ...n, read: true, isRead: true, readAt: new Date().toISOString() } : n
              );
              patchState(store, { notifications: updated });
            }),
            catchError(() => of(null))
          ))
        )
      ),

      markAllAsRead: rxMethod<void>(
        pipe(
          switchMap(() => notificationService.markAllAsRead().pipe(
            tap(() => {
              const now = new Date().toISOString();
              const updated = store.notifications().map(n => ({
                ...n,
                read: true,
                isRead: true,
                readAt: n.readAt || now
              }));
              patchState(store, { notifications: updated });
            }),
            catchError(() => of(null))
          ))
        )
      ),

      deleteNotification: rxMethod<string>(
        pipe(
          switchMap((id) => notificationService.deleteNotification(id).pipe(
            tap(() => {
              const updated = store.notifications().filter(n => n.id !== id);
              patchState(store, { notifications: updated });
            }),
            catchError(() => of(null))
          ))
        )
      ),

      clearAllNotifications: rxMethod<void>(
        pipe(
          switchMap(() => notificationService.clearAllNotifications().pipe(
            tap(() => {
              patchState(store, { notifications: [] });
            }),
            catchError(() => of(null))
          ))
        )
      ),

      handleIncomingNotification: (incoming: any) => {
        const normalized = notificationService.normalizeNotification(incoming);
        const existing = store.notifications();

        // Prevent duplicate in UI if already received
        if (existing.some(n => n.id === normalized.id)) {
          return;
        }

        const updated = [normalized, ...existing];
        patchState(store, { notifications: updated });

        // Trigger real-time toast alert
        const toastType: ToastMessage['type'] =
          normalized.type === 'IssueResolved' ? 'success' :
          normalized.type === 'IssueAssigned' ? 'info' :
          normalized.type === 'NewIssueReported' ? 'warning' : 'info';

        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const toast: ToastMessage = {
          id,
          type: toastType,
          title: normalized.title,
          message: normalized.message,
          duration: 5000
        };

        patchState(store, { toasts: [...store.toasts(), toast] });

        setTimeout(() => {
          patchState(store, (state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
        }, 5000);
      },

      // Toasts
      showToast: (toast: Omit<ToastMessage, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newToast: ToastMessage = {
          ...toast,
          id,
          duration: toast.duration ?? 4000
        };

        patchState(store, { toasts: [...store.toasts(), newToast] });

        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            patchState(store, (state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
          }, newToast.duration);
        }

        return id;
      },

      dismissToast: (id: string) => {
        patchState(store, (state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
      },

      clearToasts: () => {
        patchState(store, { toasts: [] });
      }
    };
  })
);
