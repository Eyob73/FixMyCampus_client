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
