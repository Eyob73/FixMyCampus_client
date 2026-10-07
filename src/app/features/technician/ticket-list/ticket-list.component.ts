import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';
import { NotificationStore } from '../../../store/notification.store';
import {
  Ticket,
  TicketFilterOptions,
  TicketStatus,
  TicketPriority,
  PaginatedTicketsResponse,
} from '../../../models/ticket.model';
import { StatusBadge } from '../../../components/status-badge/status-badge';
import { PriorityBadge } from '../../../components/priority-badge/priority-badge.component';
import { ConfirmModalComponent } from '../../../components/confirm-modal/confirm-modal.component';
import { PageContainerComponent } from '../../../layout/page-container/page-container';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadge, PriorityBadge, ConfirmModalComponent, PageContainerComponent],
  templateUrl: './ticket-list.component.html',
})
export class TicketListComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly notificationStore = inject(NotificationStore);
  private readonly route = inject(ActivatedRoute);

  tickets = signal<Ticket[]>([]);
  pagination = signal<PaginatedTicketsResponse | null>(null);
  loading = signal<boolean>(false);

  // Filters
  searchQuery = '';
  selectedStatus = 'ALL';
  selectedPriority = 'ALL';
  selectedCategory = 'ALL';
  selectedBuilding = 'ALL';
  currentPage = 1;
  pageSize = 10;

  // Confirm Modal state
  confirmModalOpen = false;
  confirmModalMessage = '';
  confirmLoading = false;
  pendingTicketToStart: Ticket | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['status']) this.selectedStatus = params['status'];
      if (params['priority']) this.selectedPriority = params['priority'];
      if (params['search']) this.searchQuery = params['search'];
      this.loadTickets();
    });
  }

  get isFilterActive(): boolean {
    return (
      this.searchQuery.trim().length > 0 ||
      this.selectedStatus !== 'ALL' ||
      this.selectedPriority !== 'ALL' ||
      this.selectedCategory !== 'ALL' ||
      this.selectedBuilding !== 'ALL'
    );
  }

  loadTickets(): void {
    this.loading.set(true);
    const options: TicketFilterOptions = {
      search: this.searchQuery.trim() || undefined,
      status: this.selectedStatus !== 'ALL' ? this.selectedStatus : undefined,
      priority: this.selectedPriority !== 'ALL' ? this.selectedPriority : undefined,
      category: this.selectedCategory !== 'ALL' ? this.selectedCategory : undefined,
      building: this.selectedBuilding !== 'ALL' ? this.selectedBuilding : undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    };

    this.ticketService.getTechnicianTickets(options).subscribe({
      next: (res) => {
        this.tickets.set(res.tickets);
        this.pagination.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.notificationStore.showToast({ type: 'error', message: 'Failed to load tickets from backend API.' });
        this.loading.set(false);
      },
    });
  }

  onFilterChanged(): void {
    this.currentPage = 1;
    this.loadTickets();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedPriority = 'ALL';
    this.selectedCategory = 'ALL';
    this.selectedBuilding = 'ALL';
    this.currentPage = 1;
    this.loadTickets();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadTickets();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTickets();
    }
  }

  nextPage(): void {
    const totalPages = this.pagination()?.totalPages || 1;
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.loadTickets();
    }
  }

  get paginationStart(): number {
    const total = this.pagination()?.total || 0;
    if (total === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationEnd(): number {
    const total = this.pagination()?.total || 0;
    return Math.min(this.currentPage * this.pageSize, total);
  }

  promptStartWork(ticket: Ticket): void {
    this.pendingTicketToStart = ticket;
    this.confirmModalMessage = `Are you ready to transition Ticket #${ticket.id} (${ticket.title}) to IN PROGRESS? This signals to facilities dispatch that physical work has begun.`;
    this.confirmModalOpen = true;
  }

  executeStartWork(): void {
    if (!this.pendingTicketToStart) return;
    const ticketId = this.pendingTicketToStart.id;
    this.confirmLoading = true;

    this.ticketService
      .updateStatus(ticketId, 'IN_PROGRESS', 'Technician arrived on site and initiated diagnostic repair.')
      .subscribe({
        next: () => {
          this.notificationStore.showToast({ type: 'success', message: `Ticket #${ticketId} is now marked IN PROGRESS.` });
          this.confirmLoading = false;
          this.confirmModalOpen = false;
          this.pendingTicketToStart = null;
          this.loadTickets();
        },
        error: () => {
          this.notificationStore.showToast({ type: 'error', message: `Failed to update status for Ticket #${ticketId}.` });
          this.confirmLoading = false;
        },
      });
  }

  formatDate(isoString: string): string {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  formatTimeAgo(isoString: string): string {
    if (!isoString) return 'recently';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}
