import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

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
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  constructor(
    public authService: AuthService,
    public ticketService: TicketService
  ) {}

  get navItems(): NavItem[] {
    const unassignedCount = this.ticketService.tickets().filter((t) => !t.assignedTechnicianId && t.status !== 'CLOSED').length;
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

  onNavClick(): void {
    this.closeSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
