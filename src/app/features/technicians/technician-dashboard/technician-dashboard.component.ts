import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TicketStore } from '../../../store/ticket.store';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './technician-dashboard.component.html'
})
export class TechnicianDashboardComponent implements OnInit {
  readonly ticketStore = inject(TicketStore);

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.ticketStore.loadDashboardStats();
  }
}
