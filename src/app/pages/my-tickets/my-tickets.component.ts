import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { Ticket, TicketStatus, TicketPriority } from '../../models/ticket.model';
import { MetadataService } from '../../services/metadata.service';
import { StatusBadge } from '../../components/status-badge/status-badge';
import { PageContainerComponent } from '../../layout/page-container/page-container';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StatusBadge,
    PageContainerComponent
  ],
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.css'
})
export class MyTicketsComponent implements OnInit {
  protected readonly Math = Math;
  private ticketService = inject(TicketService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tickets = signal<Ticket[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Filters
  searchQuery = signal<string>('');
  statusFilter = signal<string>('all');
  categoryFilter = signal<string>('all');
  buildingFilter = signal<string>('all');
  priorityFilter = signal<string>('all');
  sortBy = signal<'created_desc' | 'created_asc' | 'updated_desc'>('created_desc');

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(6);

  private metadataService = inject(MetadataService);

  buildings = this.metadataService.buildings;
  categories = this.metadataService.categories;

  // Filtered list
  filteredTickets = computed(() => {
    let list = this.tickets();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const category = this.categoryFilter();
    const building = this.buildingFilter();
    const priority = this.priorityFilter();
    const sort = this.sortBy();

    if (query) {
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(query) ||
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          (t.building || '').toLowerCase().includes(query) ||
          (t.room || '').toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    if (status !== 'all') {
      list = list.filter((t) => t.status === status);
    }

    if (category !== 'all') {
      list = list.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (building !== 'all') {
      list = list.filter((t) => (t.building || '').toLowerCase() === building.toLowerCase());
    }

    if (priority !== 'all') {
      list = list.filter((t) => t.priority === priority);
    }

    // Sort
    const sorted = [...list];
    if (sort === 'created_asc') {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'updated_desc') {
      sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return sorted;
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredTickets().length / this.pageSize()));
  });

  paginatedTickets = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredTickets().slice(start, start + this.pageSize());
  });

  isFilterActive = computed(() => {
    return (
      this.searchQuery().trim() !== '' ||
      this.statusFilter() !== 'all' ||
      this.categoryFilter() !== 'all' ||
      this.buildingFilter() !== 'all' ||
      this.priorityFilter() !== 'all'
    );
  });

  ngOnInit(): void {
    // Read query params if any
    this.route.queryParams.subscribe((params) => {
      if (params['search']) this.searchQuery.set(params['search']);
      if (params['status']) this.statusFilter.set(params['status']);
      if (params['category']) this.categoryFilter.set(params['category']);
      if (params['building']) this.buildingFilter.set(params['building']);
    });

    this.loadTickets();
  }

  loadTickets(): void {
    this.loading.set(true);
    this.error.set(null);

    this.ticketService.getMyTickets().subscribe({
      next: (data) => {
        this.tickets.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load tickets. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.categoryFilter.set('all');
    this.buildingFilter.set('all');
    this.priorityFilter.set('all');
    this.sortBy.set('created_desc');
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
