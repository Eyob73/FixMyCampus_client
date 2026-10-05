import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  private notifService = inject(NotificationService);
  private authService = inject(AuthService);

  isOpen = input<boolean>(false);
  closeSidebar = output<void>();

  unreadCount = this.notifService.unreadCount;
  currentUser = this.authService.currentUser;

  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Report Issue', icon: 'add_circle', route: '/report-issue' },
    { label: 'My Tickets', icon: 'confirmation_number', route: '/my-tickets' },
    { label: 'Notifications', icon: 'notifications', route: '/notifications', showBadge: true },
    { label: 'Profile', icon: 'person', route: '/profile' }
  ];

  onNavigate(): void {
    this.closeSidebar.emit();
  }

  onLogout(): void {
    if (confirm('Are you sure you want to sign out of the FixMyCampus Reporter portal?')) {
      this.authService.logout();
      window.location.href = '/dashboard';
    }
  }
}
