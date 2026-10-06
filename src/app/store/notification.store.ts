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
}

const initialState: NotificationState = {
  toasts: [],
  notifications: []
};

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ notifications }) => ({
    unreadCount: computed(() => notifications().filter(n => !n.read).length)
  })),
  withMethods((store, notificationService = inject(NotificationService)) => {
    return {
      loadNotifications: rxMethod<void>(
        pipe(
          switchMap(() => notificationService.getNotifications().pipe(
            tap((notifications) => {
              if (Array.isArray(notifications)) {
                patchState(store, { notifications });
              }
            }),
            catchError(() => of(null))
          ))
        )
      ),
      markAsRead: rxMethod<string>(
        pipe(
          switchMap((id) => notificationService.markAsRead(id).pipe(
            tap(() => {
              const updated = store.notifications().map(n => n.id === id ? { ...n, read: true } : n);
              patchState(store, { notifications: updated });
            }),
            catchError(() => {
              return of(null);
            })
          ))
        )
      ),
      markAllAsRead: rxMethod<void>(
        pipe(
          switchMap(() => notificationService.markAllAsRead().pipe(
            tap(() => {
              const updated = store.notifications().map(n => ({ ...n, read: true }));
              patchState(store, { notifications: updated });
            }),
            catchError(() => {
              return of(null);
            })
          ))
        )
      ),
      addNotification: (item: Omit<AppNotification, 'id' | 'createdAt'>) => {
        // Typically notifications should be pushed via SignalR or loaded via API,
        // but if the client generates one locally we can patch state for now.
        const newNotif: AppNotification = {
          ...item,
          id: `notif-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        const updated = [newNotif, ...store.notifications()];
        patchState(store, { notifications: updated });
      },
      
      // Toasts
      showToast: (toast: Omit<ToastMessage, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newToast: ToastMessage = {
          ...toast,
          id,
          duration: toast.duration ?? 4000,
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
