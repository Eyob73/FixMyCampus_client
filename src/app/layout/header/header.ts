import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { TicketService } from '../../core/services/ticket.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() openNewTicket = new EventEmitter<void>();

  router = inject(Router);
  notifService = inject(NotificationService);
  authService = inject(AuthService);
  ticketService = inject(TicketService);

  searchQuery = '';
  showNotifMenu = signal<boolean>(false);
  showUserMenu = signal<boolean>(false);
  showHelpModal = signal<boolean>(false);
  showNotifications = false;

  unreadCount = this.notifService.unreadCount;
  notificationsList = this.notifService.notifications;
  currentUser = this.authService.currentUser;

  get userInitials(): string {
    const name = this.currentUser().name || 'Tech';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  get notifications(): Array<{ id: string; title: string; time: string; icon: string; type: string }> {
    return [
      { id: '1', title: 'Emergency: Lab 304 temp spike above 78°F', time: '12m ago', icon: 'error', type: 'danger' },
      { id: '2', title: 'Ticket #T-1078 was marked Resolved', time: '45m ago', icon: 'check_circle', type: 'success' },
      { id: '3', title: 'Hydraulic maintenance scheduled', time: '2h ago', icon: 'schedule', type: 'info' }
    ];
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
    this.notifService.markAllAsRead().subscribe();
  }

  goToTickets(): void {
    this.closeNotifs();
    this.router.navigate(['/admin/tickets']);
  }

  onLogout(): void {
    this.closeMenus();
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
      this.router.navigate(['/dashboard']);
    }
  }
}
