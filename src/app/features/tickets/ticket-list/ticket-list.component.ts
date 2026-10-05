import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilterBarComponent } from '../../../components/filter-bar/filter-bar.component';
import { StatusBadgeComponent } from '../../../ui/badge/status-badge.component';
import { ConfirmModalComponent } from '../../../ui/confirm-modal/confirm-modal.component';
import { TicketCreateModalComponent } from '../../../components/ticket-create-modal/ticket-create-modal.component';
import { BuildingService } from '../../../services/building.service';
import { NotificationService } from '../../../services/notification.service';
import { TechnicianService } from '../../../services/technician.service';
import { TicketService } from '../../../services/ticket.service';
import { Ticket, TicketFilterParams, TicketStatus } from '../../../models';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    FilterBarComponent,
    StatusBadgeComponent,
    ConfirmModalComponent,
    TicketCreateModalComponent
  ],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.css'
})
export class TicketListComponent implements OnInit {
  filterParams = signal<TicketFilterParams>({});
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  selectedTicketIds = signal<Set<string>>(new Set());

  // Modals state
  showCreateModal = false;
  showConfirmDelete = false;
  ticketToDelete: string | null = null;
  showBulkStatusModal = false;
  bulkStatusTarget: TicketStatus = 'IN_PROGRESS';

  // Filtered tickets
  filteredTickets = computed<Ticket[]>(() => {
    let result = [...this.ticketService.tickets()];
    const p = this.filterParams();

    if (p.search) {
      const s = p.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(s) ||
          t.title.toLowerCase().includes(s) ||
          t.building.toLowerCase().includes(s) ||
          t.reporterName.toLowerCase().includes(s) ||
          (t.assignedTechnicianName && t.assignedTechnicianName.toLowerCase().includes(s))
      );
    }

    if (p.status && p.status !== 'ALL') {
      result = result.filter((t) => t.status === p.status);
    }

    if (p.priority && p.priority !== 'ALL') {
      result = result.filter((t) => t.priority === p.priority);
    }

    if (p.category && p.category !== 'ALL') {
      result = result.filter((t) => t.category === p.category);
    }

    if (p.building && p.building !== 'ALL') {
      result = result.filter((t) => t.building === p.building);
    }

    return result;
  });

  // Paginated tickets
  paginatedTickets = computed<Ticket[]>(() => {
    const all = this.filteredTickets();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

  totalPages = computed<number>(() => {
    return Math.ceil(this.filteredTickets().length / this.pageSize()) || 1;
  });

  constructor(
    public ticketService: TicketService,
    public buildingService: BuildingService,
    public technicianService: TechnicianService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['status']) {
        this.filterParams.update((f) => ({ ...f, status: params['status'] }));
      }
    });
  }

  onFilterChange(newParams: TicketFilterParams): void {
    this.filterParams.set(newParams);
    this.currentPage.set(1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      const allIds = new Set(this.paginatedTickets().map((t) => t.id));
      this.selectedTicketIds.set(allIds);
    } else {
      this.selectedTicketIds.set(new Set());
    }
  }

  toggleSelect(id: string): void {
    const current = new Set(this.selectedTicketIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedTicketIds.set(current);
  }

  isTicketSelected(id: string): boolean {
    return this.selectedTicketIds().has(id);
  }

  areAllSelected(): boolean {
    const pageTickets = this.paginatedTickets();
    if (!pageTickets.length) return false;
    return pageTickets.every((t) => this.selectedTicketIds().has(t.id));
  }

  clearSelection(): void {
    this.selectedTicketIds.set(new Set());
  }

  openDeletePrompt(ticketNumber: string, event: Event): void {
    event.stopPropagation();
    this.ticketToDelete = ticketNumber;
    this.showConfirmDelete = true;
  }

  confirmDelete(): void {
    if (this.ticketToDelete) {
      this.ticketService.deleteTicket(this.ticketToDelete).subscribe({
        next: () => {
          this.notificationService.success('Ticket Deleted', `Ticket #${this.ticketToDelete} has been removed.`);
          this.showConfirmDelete = false;
          this.ticketToDelete = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showConfirmDelete = false;
    this.ticketToDelete = null;
  }

  applyBulkStatus(): void {
    const ids = Array.from(this.selectedTicketIds());
    if (!ids.length) return;

    ids.forEach((id) => {
      this.ticketService.updateStatus(id, this.bulkStatusTarget).subscribe();
    });

    this.notificationService.success(
      'Bulk Update Applied',
      `Updated ${ids.length} tickets to ${this.bulkStatusTarget}.`
    );
    this.selectedTicketIds.set(new Set());
    this.showBulkStatusModal = false;
  }
}
