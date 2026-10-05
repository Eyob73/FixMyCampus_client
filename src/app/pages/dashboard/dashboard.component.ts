import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../core/services/ticket.service';
import { AuthService } from '../../core/services/auth.service';
import { Ticket, TicketStats } from '../../core/models/ticket.model';
import { StatusBadge } from '../../components/status-badge/status-badge';
import { PageContainerComponent } from '../../layout/page-container/page-container';
import { CAMPUS_BUILDINGS } from '../../core/services/mock-data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StatusBadge,
    PageContainerComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  
  stats = signal<TicketStats>({
    totalSubmitted: 0,
    openCount: 0,
    inProgressCount: 0,
    resolvedCount: 0,
    closedCount: 0
  });

  allRecentTickets = signal<Ticket[]>([]);
  filteredTickets = signal<Ticket[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  selectedStatus = signal<string>('all');
  selectedBuilding = signal<string>('all');

  buildings = CAMPUS_BUILDINGS;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Fetch stats
    this.ticketService.getTicketStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error fetching stats', err)
    });

    // Fetch recent tickets
    this.ticketService.getRecentTickets(10).subscribe({
      next: (tickets) => {
        this.allRecentTickets.set(tickets);
        this.applyFilter();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load dashboard data. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onStatusChange(val: string): void {
    this.selectedStatus.set(val);
    this.applyFilter();
  }

  onBuildingChange(val: string): void {
    this.selectedBuilding.set(val);
    this.applyFilter();
  }

  applyFilter(): void {
    let list = this.allRecentTickets();
    const status = this.selectedStatus();
    const building = this.selectedBuilding();

    if (status !== 'all') {
      list = list.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }

    if (building !== 'all') {
      list = list.filter((t) => (t.building || '').toLowerCase() === building.toLowerCase());
    }

    this.filteredTickets.set(list);
  }
}
