import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Ticket, TicketStats } from '../../models/ticket.model';
import { StatusBadge } from '../../components/status-badge/status-badge';
import { PageContainerComponent } from '../../layout/page-container/page-container';
import { MetadataService } from '../../services/metadata.service';
import { TicketStore } from '../../store/ticket.store';

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
  private ticketStore = inject(TicketStore);
  private authService = inject(AuthService);
  private metadataService = inject(MetadataService);

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
  loading = this.ticketStore.isLoading;
  error = signal<string | null>(null);

  selectedStatus = signal<string>('all');
  selectedBuilding = signal<string>('all');

  buildings = this.metadataService.buildings;

  constructor() {
    effect(() => {
      const tickets = this.ticketStore.tickets();
      this.allRecentTickets.set(tickets.slice(0, 10)); // Just use first 10 for recent
      
      const st = {
        totalSubmitted: tickets.length,
        openCount: tickets.filter(t => t.status === 'NEW').length,
        inProgressCount: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolvedCount: tickets.filter(t => t.status === 'RESOLVED').length,
        closedCount: tickets.filter(t => t.status === 'CLOSED').length
      };
      this.stats.set(st);
      
      this.applyFilter();
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.ticketStore.loadTickets();
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
