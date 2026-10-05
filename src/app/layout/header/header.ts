import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() openNewTicket = new EventEmitter<void>();

  showNotifications = false;

  constructor(
    public authService: AuthService,
    public ticketService: TicketService,
    private router: Router
  ) {}

  get notifications(): Array<{ id: string; title: string; time: string; icon: string; type: string }> {
    return [
      {
        id: '1',
        title: 'Emergency: Lab 304 temp spike above 78°F',
        time: '12m ago',
        icon: 'error',
        type: 'danger'
      },
      {
        id: '2',
        title: 'Ticket #T-1078 was marked Resolved by James Reynolds',
        time: '45m ago',
        icon: 'check_circle',
        type: 'success'
      },
      {
        id: '3',
        title: 'Hydraulic maintenance scheduled for Founders Tower',
        time: '2h ago',
        icon: 'schedule',
        type: 'info'
      }
    ];
  }

  toggleNotifs(): void {
    this.showNotifications = !this.showNotifications;
  }

  closeNotifs(): void {
    this.showNotifications = false;
  }

  goToTickets(): void {
    this.closeNotifs();
    this.router.navigate(['/admin/tickets']);
  }
}
