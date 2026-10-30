import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationStore } from '../../../store/notification.store';
import { AuthService } from '../../../services/auth.service';
import { AppNotification } from '../../../models/notification.model';
import { PageContainerComponent } from '../../../layout/page-container/page-container';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, PageContainerComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  private notificationStore = inject(NotificationStore);
  private authService = inject(AuthService);
  private router = inject(Router);

  notifications = this.notificationStore.notifications;
  unreadCount = this.notificationStore.unreadCount;
  loading = this.notificationStore.loading;

  filterTab = signal<'all' | 'unread' | 'read'>('all');

  readCount = computed(() => this.notifications().filter((n: AppNotification) => n.read || n.isRead).length);

  filteredList = computed(() => {
    const list = this.notifications();
    if (this.filterTab() === 'unread') {
      return list.filter((n: AppNotification) => !n.read && !n.isRead);
    }
    if (this.filterTab() === 'read') {
      return list.filter((n: AppNotification) => n.read || n.isRead);
    }
    return list;
  });

  get dashboardRoute(): string {
    if (this.authService.isAdmin()) return '/admin/dashboard';
    if (this.authService.isTechnician()) return '/technician/dashboard';
    return '/reporter/dashboard';
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.notificationStore.loadNotifications();
  }

  markAsRead(item: AppNotification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!item.read && !item.isRead) {
      this.notificationStore.markAsRead(item.id);
    }
  }

  markAllAsRead(): void {
    this.notificationStore.markAllAsRead();
  }

  deleteNotification(item: AppNotification, event: Event): void {
    event.stopPropagation();
    this.notificationStore.deleteNotification(item.id);
  }

  clearAll(): void {
    if (confirm('Are you sure you want to delete all notifications?')) {
      this.notificationStore.clearAllNotifications();
    }
  }

  onNotificationClick(item: AppNotification): void {
    if (!item.read && !item.isRead) {
      this.notificationStore.markAsRead(item.id);
    }

    if (item.ticketId) {
      const route = this.getTicketRoute(item.ticketId);
      this.router.navigate(route);
    }
  }

  getTicketRoute(ticketId: string): string[] {
    if (this.authService.isAdmin()) {
      return ['/admin/tickets', ticketId];
    } else if (this.authService.isTechnician()) {
      return ['/technician/tickets', ticketId];
    } else {
      return ['/reporter/ticket', ticketId];
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'NewIssueReported':
      case 'ticket_created':
        return 'report_problem';
      case 'IssueAssigned':
      case 'ticket_assigned':
        return 'engineering';
      case 'IssueInProgress':
      case 'status_changed':
        return 'construction';
      case 'IssueResolved':
      case 'ticket_resolved':
        return 'check_circle';
      case 'ticket_closed':
        return 'verified';
      case 'new_comment':
        return 'chat';
      default:
        return 'notifications';
    }
  }

  getIconStyle(type: string): string {
    switch (type) {
      case 'NewIssueReported':
      case 'ticket_created':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'IssueAssigned':
      case 'ticket_assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IssueInProgress':
      case 'status_changed':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'IssueResolved':
      case 'ticket_resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ticket_closed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'new_comment':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }
}
