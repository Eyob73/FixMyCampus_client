import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TicketService } from '../../core/services/ticket.service';
import { NotificationService } from '../../core/services/notification.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
  showBadge?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  ticketService = inject(TicketService);
  notifService = inject(NotificationService);
  router = inject(Router);

  unreadCount = this.notifService.unreadCount;
  currentUser = this.authService.currentUser;

  get userInitials(): string {
    const name = this.currentUser().name || 'Tech';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  get navItems(): NavItem[] {
    if (this.authService.isTechnician()) {
      const inProgress = this.ticketService.currentStats()?.inProgress ?? 0;
      const newAssigned = this.ticketService.currentStats()?.newAssigned ?? 0;
      return [
        { label: 'Dashboard', route: '/technician/dashboard', icon: 'dashboard' },
        { label: 'My Tickets', route: '/technician/tickets', icon: 'confirmation_number', badge: newAssigned > 0 ? newAssigned : undefined },
      ];
    }

    if (this.authService.isReporter()) {
      return [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { label: 'Report Issue', icon: 'add_circle', route: '/report-issue' },
        { label: 'My Tickets', icon: 'confirmation_number', route: '/my-tickets' },
        { label: 'Notifications', icon: 'notifications', route: '/notifications', showBadge: true },
        { label: 'Profile', icon: 'person', route: '/profile' }
      ];
    }

    // Admin nav items
    const unassignedCount = this.ticketService.tickets().filter((t) => !t.assignedTechnician && t.status !== 'closed' && t.status !== 'CLOSED').length;
    return [
      { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
      { label: 'Tickets', route: '/admin/tickets', icon: 'confirmation_number', badge: unassignedCount > 0 ? unassignedCount : undefined },
      { label: 'Technicians', route: '/admin/technicians', icon: 'engineering' },
      { label: 'Reporters', route: '/admin/reporters', icon: 'group' },
      { label: 'Buildings', route: '/admin/buildings', icon: 'domain' },
      { label: 'Reports & Metrics', route: '/admin/reports', icon: 'analytics' },
      { label: 'Settings', route: '/admin/settings', icon: 'settings' }
    ];
  }

  onNavigate(): void {
    this.closeSidebar.emit();
  }

  onNavClick(): void {
    this.closeSidebar.emit();
  }

  onLogout(): void {
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
      this.router.navigate(['/dashboard']);
    }
  }

  logout(): void {
    this.onLogout();
  }
}
