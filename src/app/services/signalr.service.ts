import { Injectable, inject, signal, effect } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { NotificationStore } from '../store/notification.store';

@Injectable({
  providedIn: 'root'
})
export class SignalRNotificationService {
  private authService = inject(AuthService);
  private notificationStore = inject(NotificationStore);

  private hubConnection: HubConnection | null = null;
  private isConnecting = false;

  public connectionStatus = signal<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');

  constructor() {
    // Reactively start or stop SignalR based on authentication status
    effect(() => {
      const user = this.authService.currentUser();
      const token = this.authService.getToken();

      if (user && token) {
        this.startConnection();
      } else {
        this.stopConnection();
      }
    });
  }

  public async startConnection(): Promise<void> {
    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    if (this.hubConnection && (
      this.hubConnection.state === HubConnectionState.Connected ||
      this.hubConnection.state === HubConnectionState.Connecting
    )) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.connectionStatus.set('connecting');

    try {
      const hubBaseUrl = environment.apiUrl.replace(/\/api$/, '');
      const fullHubUrl = `${hubBaseUrl}/hubs/notifications`;

      this.hubConnection = new HubConnectionBuilder()
        .withUrl(fullHubUrl, {
          accessTokenFactory: () => this.authService.getToken() || ''
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(environment.production ? LogLevel.None : LogLevel.Information)
        .build();

      this.registerHandlers(this.hubConnection);

      await this.hubConnection.start();
      this.connectionStatus.set('connected');
      this.isConnecting = false;

      // Initial fetch to ensure up-to-date notifications on connect
      this.notificationStore.loadNotifications();
    } catch (error) {
      this.connectionStatus.set('disconnected');
      this.isConnecting = false;
      // Retry in 5 seconds if still authenticated
      if (this.authService.isAuthenticated()) {
        setTimeout(() => this.startConnection(), 5000);
      }
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
      } catch {
        // Ignored on teardown
      } finally {
        this.hubConnection = null;
        this.connectionStatus.set('disconnected');
        this.isConnecting = false;
      }
    }
  }

  private registerHandlers(connection: HubConnection): void {
    connection.on('ReceiveNotification', (notification: any) => {
      this.notificationStore.handleIncomingNotification(notification);
    });

    connection.on('UpdateUnreadCount', (count: number) => {
      // Unread count is computed reactively, but we can also trigger a lightweight sync if needed
    });

    connection.onreconnecting((error) => {
      this.connectionStatus.set('reconnecting');
    });

    connection.onreconnected((connectionId) => {
      this.connectionStatus.set('connected');
      // Refresh notifications from API after reconnecting to catch any missed events while offline
      this.notificationStore.loadNotifications();
    });

    connection.onclose((error) => {
      this.connectionStatus.set('disconnected');
      this.isConnecting = false;
      // Attempt reconnection if user is still logged in
      if (this.authService.isAuthenticated()) {
        setTimeout(() => this.startConnection(), 5000);
      }
    });
  }
}
