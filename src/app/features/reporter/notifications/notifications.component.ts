import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationStore } from '../../../store/notification.store';
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

  notifications = this.notificationStore.notifications;
  unreadCount = this.notificationStore.unreadCount;

  filterTab = signal<'all' | 'unread'>('all');
  loading = signal<boolean>(false);

  filteredList = computed(() => {
    if (this.filterTab() === 'unread') {
      return this.notifications().filter((n: AppNotification) => !n.read);
    }
    return this.notifications();
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.notificationStore.loadNotifications();
  }

  markAsRead(item: AppNotification, event: Event): void {
    event.stopPropagation();
    if (!item.read) {
      this.notificationStore.markAsRead(item.id);
    }
  }

  markAllAsRead(): void {
    this.notificationStore.markAllAsRead();
  }

  getIcon(type: string): string {
    switch (type) {
      case 'ticket_assigned':
        return 'person_pin';
      case 'status_changed':
        return 'engineering';
      case 'ticket_resolved':
        return 'task_alt';
      case 'ticket_closed':
        return 'verified';
      case 'new_comment':
        return 'chat';
      case 'ticket_created':
      default:
        return 'notifications';
    }
  }

  getIconStyle(type: string): string {
    switch (type) {
      case 'ticket_assigned':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
      case 'status_changed':
        return 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]';
      case 'ticket_resolved':
      case 'ticket_closed':
        return 'bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]';
      case 'new_comment':
        return 'bg-[#EFF4FF] text-[#1E3A8A] border-[#C7D2FE]';
      case 'ticket_created':
      default:
        return 'bg-[#F8FAFC] text-[#64748B] border-[#CBD5E1]';
    }
  }
}
