import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketCategory, TicketFilterParams, TicketPriority, TicketStatus } from '../../models';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white border border-slate-200 rounded-lg p-3 lg:p-4 mb-4 shadow-2xs space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-[260px] max-w-md">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Search tickets, IDs, rooms, staff..."
            class="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          @if (searchQuery) {
            <button
              type="button"
              (click)="clearSearch()"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          }
        </div>

        <!-- Filter Selects -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Status Select -->
          <div class="relative">
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onFilterChange()"
              class="appearance-none bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded py-2 pl-3 pr-8 hover:border-slate-400 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New (Unassigned)</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
              expand_more
            </span>
          </div>

          <!-- Priority Select -->
          <div class="relative">
            <select
              [(ngModel)]="selectedPriority"
              (ngModelChange)="onFilterChange()"
              class="appearance-none bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded py-2 pl-3 pr-8 hover:border-slate-400 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
              expand_more
            </span>
          </div>

          <!-- Category Select -->
          <div class="relative">
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onFilterChange()"
              class="appearance-none bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded py-2 pl-3 pr-8 hover:border-slate-400 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="HVAC">HVAC & Climate</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="ELECTRICAL">Electrical & Power</option>
              <option value="STRUCTURAL">Structural & Civil</option>
              <option value="IT_SECURITY">Access Control & Security</option>
            </select>
            <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
              expand_more
            </span>
          </div>

          <!-- Building Select -->
          @if (buildings && buildings.length) {
            <div class="relative">
              <select
                [(ngModel)]="selectedBuilding"
                (ngModelChange)="onFilterChange()"
                class="appearance-none bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded py-2 pl-3 pr-8 hover:border-slate-400 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer max-w-[180px] truncate"
              >
                <option value="ALL">All Buildings</option>
                @for (b of buildings; track b.id) {
                  <option [value]="b.name">{{ b.name }}</option>
                }
              </select>
              <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
                expand_more
              </span>
            </div>
          }

          <!-- Reset Filter Button -->
          @if (isFiltered) {
            <button
              type="button"
              (click)="resetFilters()"
              class="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
            >
              <span class="material-symbols-outlined text-sm">restart_alt</span>
              Reset
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class FilterBarComponent {
  @Input() buildings: Array<{ id: string; name: string }> = [];

  @Output() filterChange = new EventEmitter<TicketFilterParams>();

  searchQuery = '';
  selectedStatus: TicketStatus | 'ALL' = 'ALL';
  selectedPriority: TicketPriority | 'ALL' = 'ALL';
  selectedCategory: TicketCategory | 'ALL' = 'ALL';
  selectedBuilding = 'ALL';
  selectedTechnician = 'ALL';

  get isFiltered(): boolean {
    return (
      Boolean(this.searchQuery.trim()) ||
      this.selectedStatus !== 'ALL' ||
      this.selectedPriority !== 'ALL' ||
      this.selectedCategory !== 'ALL' ||
      this.selectedBuilding !== 'ALL' ||
      this.selectedTechnician !== 'ALL'
    );
  }

  onSearchChange(): void {
    this.emitChange();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.emitChange();
  }

  onFilterChange(): void {
    this.emitChange();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedPriority = 'ALL';
    this.selectedCategory = 'ALL';
    this.selectedBuilding = 'ALL';
    this.selectedTechnician = 'ALL';
    this.emitChange();
  }

  private emitChange(): void {
    const params: TicketFilterParams = {
      search: this.searchQuery.trim() || undefined,
      status: this.selectedStatus,
      priority: this.selectedPriority,
      category: this.selectedCategory,
      building: this.selectedBuilding !== 'ALL' ? this.selectedBuilding : undefined
    };
    this.filterChange.emit(params);
  }
}
