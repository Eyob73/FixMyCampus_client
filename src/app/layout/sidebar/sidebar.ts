import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { TicketStore } from '../../store/ticket.store';
import { DashboardStore } from '../../store/dashboard.store';
import { NotificationStore } from '../../store/notification.store';
import { LogoutDialogComponent } from '../../ui/logout-dialog/logout-dialog.component';

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
  imports: [CommonModule, RouterModule, MatDialogModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  ticketStore = inject(TicketStore);
  dashboardStore = inject(DashboardStore);
  notificationStore = inject(NotificationStore);
  router = inject(Router);
  dialog = inject(MatDialog);

  unreadCount = this.notificationStore.unreadCount;
  currentUser = this.authService.currentUser;

  get userInitials(): string {
    const name = this.currentUser()?.name || 'Tech';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  get navItems(): NavItem[] {
    if (this.authService.isTechnician()) {
      const newAssigned = this.dashboardStore.technicianStats()?.newAssigned ?? 0;
      return [
        { label: 'Dashboard', route: '/technician/dashboard', icon: 'dashboard' },
        { label: 'My Tickets', route: '/technician/tickets', icon: 'confirmation_number', badge: newAssigned > 0 ? newAssigned : undefined },
      ];
    }

    if (this.authService.isReporter()) {
      return [
        { label: 'Dashboard', icon: 'dashboard', route: '/reporter/dashboard' },
        { label: 'Report Issue', icon: 'add_circle', route: '/reporter/report-issue' },
        { label: 'My Tickets', icon: 'confirmation_number', route: '/reporter/my-tickets' },
        { label: 'Notifications', icon: 'notifications', route: '/reporter/notifications', showBadge: true },
        { label: 'Profile', icon: 'person', route: '/reporter/profile' }
      ];
    }

    // Admin nav items
    const unassignedCount = this.ticketStore.tickets().filter((t: any) => !t.assignedTechnicianId && t.status !== 'CLOSED').length;
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
    const dialogRef = this.dialog.open(LogoutDialogComponent, {
      width: '420px',
      panelClass: 'custom-dialog-container',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.closeSidebar.emit();
        this.authService.logout();
      }
    });
  }

  logout(): void {
    this.onLogout();
  }
}
