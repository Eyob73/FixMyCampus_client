import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppNotification } from '../models/notification.model';
import { environment } from '../../environments/environment';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly baseUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(unreadOnly?: boolean, pageNumber: number = 1, pageSize: number = 50): Observable<AppNotification[]> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (unreadOnly !== undefined) {
      params = params.set('unreadOnly', unreadOnly.toString());
    }

    return this.http.get<any[]>(this.baseUrl, { params }).pipe(
      map(items => (items || []).map(n => this.normalizeNotification(n)))
    );
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/unread-count`);
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/mark-all-read`, {});
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  clearAllNotifications(): Observable<void> {
    return this.http.delete<void>(this.baseUrl);
  }

  public normalizeNotification(item: any): AppNotification {
    const isRead = item.isRead ?? item.read ?? false;
    return {
      id: item.id?.toString() || '',
      userId: item.userId?.toString() || '',
      title: item.title || '',
      message: item.message || '',
      type: item.type || 'General',
      ticketId: item.ticketId?.toString() || undefined,
      read: isRead,
      isRead: isRead,
      createdAt: item.createdAt || new Date().toISOString(),
      readAt: item.readAt || undefined,
      ticketTitle: item.ticketTitle,
      ticketCategory: item.ticketCategory,
      ticketBuilding: item.ticketBuilding,
      ticketStatus: item.ticketStatus
    };
  }
}
