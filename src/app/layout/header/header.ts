import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotificationStore } from '../../store/notification.store';
import { AuthService } from '../../services/auth.service';
import { TicketStore } from '../../store/ticket.store';
import { LogoutDialogComponent } from '../../ui/logout-dialog/logout-dialog.component';
import { AppNotification } from '../../models/notification.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatDialogModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  host: {
    class: 'sticky top-0 z-50 block w-full'
  }
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() openNewTicket = new EventEmitter<void>();

  router = inject(Router);
  notificationStore = inject(NotificationStore);
  authService = inject(AuthService);
  ticketStore = inject(TicketStore);
  dialog = inject(MatDialog);

  searchQuery = '';
  showNotifMenu = signal<boolean>(false);
  showUserMenu = signal<boolean>(false);
  showHelpModal = signal<boolean>(false);
  showNotifications = false;

  unreadCount = this.notificationStore.unreadCount;
  notificationsList = this.notificationStore.notifications;
  currentUser = this.authService.currentUser;

  get userInitials(): string {
    const name = this.currentUser()?.name || 'Tech';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  onSearchSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const q = this.searchQuery.trim();
    if (q) {
      if (this.authService.isTechnician()) {
        this.router.navigate(['/technician/tickets'], { queryParams: { search: q } });
      } else {
        this.router.navigate(['/my-tickets'], { queryParams: { search: q } });
      }
    }
  }

  toggleNotifs(): void {
    this.showNotifMenu.update(v => !v);
    this.showUserMenu.set(false);
    this.showNotifications = !this.showNotifications;
  }

  closeNotifs(): void {
    this.showNotifications = false;
    this.showNotifMenu.set(false);
  }

  toggleUser(): void {
    this.showUserMenu.update(v => !v);
    this.showNotifMenu.set(false);
  }

  closeMenus(): void {
    this.showNotifMenu.set(false);
    this.showUserMenu.set(false);
    this.showNotifications = false;
  }

  toggleHelpModal(): void {
    this.showHelpModal.update(v => !v);
  }

  markAllAsRead(): void {
    this.notificationStore.markAllAsRead();
  }

  markItemAsRead(item: AppNotification, event: Event): void {
    event.stopPropagation();
    if (!item.read && !item.isRead) {
      this.notificationStore.markAsRead(item.id);
    }
  }

  onNotificationClick(item: AppNotification): void {
    if (!item.read && !item.isRead) {
      this.notificationStore.markAsRead(item.id);
    }
    this.closeMenus();

    if (item.ticketId) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin/tickets', item.ticketId]);
      } else if (this.authService.isTechnician()) {
        this.router.navigate(['/technician/tickets', item.ticketId]);
      } else {
        this.router.navigate(['/reporter/ticket', item.ticketId]);
      }
    } else {
      this.goToNotificationsPage();
    }
  }

  goToNotificationsPage(): void {
    this.closeMenus();
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/notifications']);
    } else if (this.authService.isTechnician()) {
      this.router.navigate(['/technician/notifications']);
    } else {
      this.router.navigate(['/reporter/notifications']);
    }
  }

  goToTickets(): void {
    this.closeNotifs();
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/tickets']);
    } else if (this.authService.isTechnician()) {
      this.router.navigate(['/technician/tickets']);
    } else {
      this.router.navigate(['/reporter/my-tickets']);
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
      case 'new_comment':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }

  onLogout(): void {
    this.closeMenus();
    const dialogRef = this.dialog.open(LogoutDialogComponent, {
      width: '420px',
      panelClass: 'custom-dialog-container',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.authService.logout();
      }
    });
  }
}
