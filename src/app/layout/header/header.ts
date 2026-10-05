import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  private router = inject(Router);
  private notifService = inject(NotificationService);
  private authService = inject(AuthService);

  toggleSidebar = output<void>();

  searchQuery = signal<string>('');
  showNotifMenu = signal<boolean>(false);
  showUserMenu = signal<boolean>(false);

  unreadCount = this.notifService.unreadCount;
  notifications = this.notifService.notifications;
  currentUser = this.authService.currentUser;

  onSearchSubmit(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/my-tickets'], { queryParams: { search: q } });
    }
  }

  toggleNotifs(): void {
    this.showNotifMenu.update(v => !v);
    this.showUserMenu.set(false);
  }

  toggleUser(): void {
    this.showUserMenu.update(v => !v);
    this.showNotifMenu.set(false);
  }

  closeMenus(): void {
    this.showNotifMenu.set(false);
    this.showUserMenu.set(false);
  }

  markAllAsRead(): void {
    this.notifService.markAllAsRead().subscribe();
  }

  onLogout(): void {
    this.closeMenus();
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
      this.router.navigate(['/dashboard']);
    }
  }
}
