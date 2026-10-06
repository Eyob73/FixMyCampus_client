import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  constructor(private http: HttpClient) {}

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${environment.apiUrl}/notifications`);
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/notifications/mark-all-read`, {});
  }
}
