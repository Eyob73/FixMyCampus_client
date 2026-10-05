import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  Ticket,
  TicketFilterOptions,
  TicketStatus,
  TicketPriority,
  PaginatedTicketsResponse,
} from '../../../core/models/ticket.model';
import { StatusBadge } from '../../../components/status-badge/status-badge';
import { PriorityBadge } from '../../../components/priority-badge/priority-badge.component';
import { ConfirmModalComponent } from '../../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadge, PriorityBadge, ConfirmModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Page Title & Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl font-bold text-[#0F172A] tracking-tight">My Assigned Tickets</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E5EEFF] text-[#00236F] border border-[#C5C5D3]">
              {{ pagination()?.total ?? 0 }} total
            </span>
          </div>
          <p class="text-sm text-[#64748B] mt-0.5">
            Work orders assigned exclusively to your queue. Update status as you progress.
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            (click)="loadTickets()"
            [disabled]="loading()"
            class="px-3 py-2 bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-[16px]" [ngClass]="{ 'animate-spin': loading() }">
              refresh
            </span>
            <span>Reload</span>
          </button>
        </div>
      </div>

      <!-- Filter Bar Dock (Matching DESIGN.md) -->
      <div class="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-center">
          <!-- 1. Search input -->
          <div class="lg:col-span-2 relative">
            <span class="material-symbols-outlined absolute left-3 top-2 text-[18px] text-[#94A3B8]">search</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onFilterChanged()"
              placeholder="Search ID, title, room, reporter..."
              class="w-full pl-9 pr-3 py-1.5 h-[38px] bg-white border border-[#CBD5E1] rounded text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
            />
          </div>

          <!-- 2. Status Dropdown -->
          <div>
            <label class="sr-only">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onFilterChanged()"
              class="w-full h-[38px] px-3 bg-white border border-[#CBD5E1] rounded text-xs font-medium text-[#334155] focus:outline-none focus:border-[#1E3A8A]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned (Queued)</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <!-- 3. Priority Dropdown -->
          <div>
            <label class="sr-only">Priority</label>
            <select
              [(ngModel)]="selectedPriority"
              (ngModelChange)="onFilterChanged()"
              class="w-full h-[38px] px-3 bg-white border border-[#CBD5E1] rounded text-xs font-medium text-[#334155] focus:outline-none focus:border-[#1E3A8A]"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <!-- 4. Category Dropdown -->
          <div>
            <label class="sr-only">Category</label>
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onFilterChanged()"
              class="w-full h-[38px] px-3 bg-white border border-[#CBD5E1] rounded text-xs font-medium text-[#334155] focus:outline-none focus:border-[#1E3A8A]"
            >
              <option value="ALL">All Categories</option>
              <option value="Equipment & AV">Equipment & AV</option>
              <option value="Safety & Security">Safety & Security</option>
              <option value="HVAC & Heating">HVAC & Heating</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Structural & Doors">Structural & Doors</option>
            </select>
          </div>

          <!-- 5. Building Dropdown -->
          <div>
            <label class="sr-only">Building</label>
            <select
              [(ngModel)]="selectedBuilding"
              (ngModelChange)="onFilterChanged()"
              class="w-full h-[38px] px-3 bg-white border border-[#CBD5E1] rounded text-xs font-medium text-[#334155] focus:outline-none focus:border-[#1E3A8A]"
            >
              <option value="ALL">All Buildings</option>
              <option value="Science Building">Science Building</option>
              <option value="Engineering Hall">Engineering Hall</option>
              <option value="Arts & Humanities Center">Arts & Humanities</option>
              <option value="Library West">Library West</option>
              <option value="Student Union">Student Union</option>
            </select>
          </div>
        </div>

        <!-- Filter Active Indicators & Reset -->
        @if (isFilterActive) {
          <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div class="flex items-center gap-2 text-slate-500">
              <span class="font-medium">Active Filters applied</span>
            </div>
            <button
              type="button"
              (click)="resetFilters()"
              class="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[14px]">close</span>
              <span>Clear All Filters</span>
            </button>
          </div>
        }
      </div>

      <!-- Tickets Data Table Section -->
      <section class="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">Pri</th>
                <th class="py-3.5 px-4">Ticket ID & Title</th>
                <th class="py-3.5 px-4">Category</th>
                <th class="py-3.5 px-4">Location</th>
                <th class="py-3.5 px-4">Reporter</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4">Dates</th>
                <th class="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F5F9] text-sm">
              @if (loading() && tickets().length === 0) {
                <tr>
                  <td colspan="8" class="py-16 text-center text-slate-500">
                    <span class="material-symbols-outlined text-3xl animate-spin text-[#1E3A8A]">progress_activity</span>
                    <p class="text-sm font-medium mt-2">Loading assigned tickets...</p>
                  </td>
                </tr>
              } @else if (tickets().length === 0) {
                <tr>
                  <td colspan="8" class="py-16 text-center text-slate-500">
                    <span class="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                    <h3 class="text-sm font-bold text-slate-800 mt-2">No assigned tickets found</h3>
                    <p class="text-xs text-slate-500 mt-0.5">Try clearing filters or adjusting your search criteria.</p>
                    @if (isFilterActive) {
                      <button
                        (click)="resetFilters()"
                        class="mt-3 px-3 py-1.5 bg-[#1E3A8A] text-white rounded text-xs font-medium hover:bg-[#1D4ED8]"
                      >
                        Reset Filters
                      </button>
                    }
                  </td>
                </tr>
              } @else {
                @for (ticket of tickets(); track ticket.id) {
                  <tr class="hover:bg-[#F8FAFC] transition-colors group">
                    <!-- Priority Strip Column -->
                    <td class="py-4 px-4 text-center">
                      <div class="flex items-center justify-center">
                        <app-priority-badge [priority]="ticket.priority" />
                      </div>
                    </td>

                    <!-- Ticket ID & Title Stack -->
                    <td class="py-4 px-4 max-w-xs">
                      <div class="flex flex-col">
                        <a
                          [routerLink]="['/technician/tickets', ticket.id]"
                          class="font-semibold text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors hover:underline text-sm leading-snug line-clamp-1"
                        >
                          {{ ticket.id }}: {{ ticket.title }}
                        </a>
                        <p class="text-xs text-[#64748B] line-clamp-1 mt-0.5">
                          {{ ticket.description }}
                        </p>
                      </div>
                    </td>

                    <!-- Category -->
                    <td class="py-4 px-4">
                      <span class="inline-flex items-center gap-1 text-xs text-[#334155] bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {{ ticket.category }}
                      </span>
                    </td>

                    <!-- Location -->
                    <td class="py-4 px-4">
                      <div class="flex flex-col text-xs text-[#334155]">
                        <span class="font-semibold">{{ ticket.location.building }}</span>
                        <span class="text-[#64748B]">{{ ticket.location.room || 'General' }}</span>
                      </div>
                    </td>

                    <!-- Reporter -->
                    <td class="py-4 px-4">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-[#E0E7FF] text-[#4338CA] flex items-center justify-center text-[10px] font-bold shrink-0">
                          {{ ticket.reporter.name.charAt(0) }}
                        </div>
                        <div class="flex flex-col min-w-0">
                          <span class="text-xs font-medium text-[#0F172A] truncate">{{ ticket.reporter.name }}</span>
                          <span class="text-[10px] text-[#64748B] truncate">{{ ticket.reporter.email }}</span>
                        </div>
                      </div>
                    </td>

                    <!-- Status Badge -->
                    <td class="py-4 px-4">
                      <app-status-badge [status]="ticket.status" />
                    </td>

                    <!-- Dates -->
                    <td class="py-4 px-4">
                      <div class="flex flex-col text-[11px] text-[#64748B]">
                        <span>Assigned: {{ formatDate(ticket.assignedAt) }}</span>
                        <span>Updated: {{ formatTimeAgo(ticket.updatedAt) }}</span>
                      </div>
                    </td>

                    <!-- Actions -->
                    <td class="py-4 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        @if (ticket.status === 'ASSIGNED') {
                          <button
                            type="button"
                            (click)="promptStartWork(ticket)"
                            class="px-2.5 py-1.5 bg-[#1E3A8A] text-white hover:bg-[#1D4ED8] rounded-md text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                            title="Start Diagnostic & Repair"
                          >
                            <span class="material-symbols-outlined text-[14px]">play_arrow</span>
                            <span>Start Work</span>
                          </button>
                        } @else if (ticket.status === 'IN_PROGRESS') {
                          <a
                            [routerLink]="['/technician/tickets', ticket.id]"
                            class="px-2.5 py-1.5 bg-[#10B981] text-white hover:bg-[#059669] rounded-md text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                            title="Complete Work Order"
                          >
                            <span class="material-symbols-outlined text-[14px]">check</span>
                            <span>Resolve</span>
                          </a>
                        }

                        <a
                          [routerLink]="['/technician/tickets', ticket.id]"
                          class="px-2.5 py-1.5 bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#F1F5F9] rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Details</span>
                          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls Bar -->
        <div class="p-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B] bg-[#F8FAFC]">
          <div class="flex items-center gap-2">
            <span>Showing</span>
            <span class="font-bold text-[#0F172A]">{{ paginationStart }}</span>
            <span>to</span>
            <span class="font-bold text-[#0F172A]">{{ paginationEnd }}</span>
            <span>of</span>
            <span class="font-bold text-[#0F172A]">{{ pagination()?.total ?? 0 }}</span>
            <span>tickets</span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs">Page size:</span>
            <select
              [(ngModel)]="pageSize"
              (ngModelChange)="onPageSizeChange()"
              class="h-7 px-2 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none"
            >
              <option [value]="5">5</option>
              <option [value]="10">10</option>
              <option [value]="25">25</option>
            </select>

            <div class="flex items-center gap-1 ml-2">
              <button
                type="button"
                (click)="prevPage()"
                [disabled]="currentPage === 1"
                class="px-2 py-1 bg-white border border-[#CBD5E1] rounded hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700"
              >
                Previous
              </button>
              <span class="px-2 font-mono font-medium text-slate-800">
                {{ currentPage }} / {{ pagination()?.totalPages || 1 }}
              </span>
              <button
                type="button"
                (click)="nextPage()"
                [disabled]="currentPage >= (pagination()?.totalPages || 1)"
                class="px-2 py-1 bg-white border border-[#CBD5E1] rounded hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Confirmation Modal for Start Work -->
      <app-confirm-modal
        [isOpen]="confirmModalOpen"
        title="Start Work on Ticket"
        [message]="confirmModalMessage"
        confirmText="Yes, Start Work"
        variant="primary"
        [loading]="confirmLoading"
        (confirm)="executeStartWork()"
        (cancel)="confirmModalOpen = false"
      />
    </div>
  `,
})
export class TicketListComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly notification = inject(NotificationService);
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
      sortOrder: 'desc',
    };

    this.ticketService.getMyTickets(options).subscribe({
      next: (res) => {
        this.tickets.set(res.tickets);
        this.pagination.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Failed to load tickets from backend API.');
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
      .updateTicketStatus(ticketId, 'IN_PROGRESS', 'Technician arrived on site and initiated diagnostic repair.')
      .subscribe({
        next: () => {
          this.notification.success(`Ticket #${ticketId} is now marked IN PROGRESS.`);
          this.confirmLoading = false;
          this.confirmModalOpen = false;
          this.pendingTicketToStart = null;
          this.loadTickets();
        },
        error: () => {
          this.notification.error(`Failed to update status for Ticket #${ticketId}.`);
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
