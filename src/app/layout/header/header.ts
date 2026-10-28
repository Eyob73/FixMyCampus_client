import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotificationStore } from '../../store/notification.store';
import { AuthService } from '../../services/auth.service';
import { TicketStore } from '../../store/ticket.store';
import { LogoutDialogComponent } from '../../ui/logout-dialog/logout-dialog.component';

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
