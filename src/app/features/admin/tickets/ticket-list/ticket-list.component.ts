import { Component, OnInit, computed, signal, inject, Inject, ViewChild, effect, AfterViewInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilterBarComponent } from '../../../../components/filter-bar/filter-bar.component';
import { StatusBadgeComponent } from '../../../../ui/badge/status-badge.component';

import { TicketCreateModalComponent } from '../../../../components/ticket-create-modal/ticket-create-modal.component';
import { BuildingStore } from '../../../../store/building.store';
import { NotificationStore } from '../../../../store/notification.store';
import { TechnicianStore } from '../../../../store/technician.store';
import { TicketStore } from '../../../../store/ticket.store';
import { TicketService } from '../../../../services/ticket.service';
import { Ticket, TicketFilterParams, TicketStatus } from '../../../../models';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    FilterBarComponent,
    StatusBadgeComponent,
    TicketCreateModalComponent,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule
  ],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.css'
})
export class TicketListComponent implements OnInit, AfterViewInit {
  filterParams = signal<TicketFilterParams>({});
  dataSource = new MatTableDataSource<Ticket>([]);
  displayedColumns: string[] = ['select', 'priorityStrip', 'ticketNumber', 'title', 'category', 'location', 'reporter', 'technician', 'priority', 'status', 'dates', 'actions'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  selectedTicketIds = signal<Set<string>>(new Set());

  // Modals state
  showCreateModal = false;

  bulkStatusTarget: TicketStatus = 'IN_PROGRESS';

  public ticketStore = inject(TicketStore);
  public buildingStore = inject(BuildingStore);
  public technicianStore = inject(TechnicianStore);
  private notificationStore = inject(NotificationStore);
  private ticketService = inject(TicketService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  // Filtered tickets
  filteredTickets = computed<Ticket[]>(() => {
    let result = [...this.ticketStore.tickets()];
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

  constructor() {
    effect(() => {
      this.dataSource.data = this.filteredTickets();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.ticketStore.loadTickets();
    this.route.queryParams.subscribe((params) => {
      if (params['status']) {
        this.filterParams.update((f) => ({ ...f, status: params['status'] }));
      }
    });
  }

  onFilterChange(newParams: TicketFilterParams): void {
    this.filterParams.set(newParams);
    if (this.paginator) this.paginator.firstPage();
  }

  
  getPageData(): Ticket[] {
    if (!this.paginator) return this.dataSource.data;
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return this.dataSource.data.slice(startIndex, startIndex + this.paginator.pageSize);
  }

  toggleSelectAll(event: any): void {
    const checked = event.checked !== undefined ? event.checked : (event.target as HTMLInputElement).checked;
    if (checked) {
      const pageData = this.getPageData();
      const newSet = new Set(this.selectedTicketIds());
      pageData.forEach((t) => newSet.add(t.id));
      this.selectedTicketIds.set(newSet);
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
    const pageData = this.getPageData();
    if (!pageData.length) return false;
    return pageData.every((t) => this.selectedTicketIds().has(t.id));
  }

  clearSelection(): void {
    this.selectedTicketIds.set(new Set());
  }

  openDeletePrompt(ticketNumber: string, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DeleteTicketListDialogComponent, {
      width: '400px',
      data: { ticketNumber }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.ticketService.deleteTicket(ticketNumber).subscribe({
          next: () => {
            this.notificationStore.showToast({
              type: 'success',
              message: `Ticket #${ticketNumber} has been removed.`
            });
            this.ticketStore.loadTickets(); // reload
          }
        });
      }
    });
  }

  openBulkStatusModal(): void {
    const ids = Array.from(this.selectedTicketIds());
    if (!ids.length) return;

    const dialogRef = this.dialog.open(BulkStatusDialogComponent, {
      width: '400px',
      data: { count: ids.length, currentStatus: this.bulkStatusTarget }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.bulkStatusTarget = result;
        this.applyBulkStatus();
      }
    });
  }

  applyBulkStatus(): void {
    const ids = Array.from(this.selectedTicketIds());
    if (!ids.length) return;

    ids.forEach((id) => {
      this.ticketStore.updateTicketStatus({ id, status: this.bulkStatusTarget });
    });

    this.notificationStore.showToast({
      type: 'success',
      message: `Updated ${ids.length} tickets to ${this.bulkStatusTarget}.`
    });
    this.selectedTicketIds.set(new Set());
  }
}

@Component({
  selector: 'app-bulk-status-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="text-sm font-bold text-slate-900 m-0 pb-0">Change Status for {{ data.count }} Tickets</h2>
    <mat-dialog-content>
      <div class="pt-4">
        <label class="block text-xs font-semibold text-slate-600 mb-1">Target Status</label>
        <select
          [(ngModel)]="data.currentStatus"
          class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded"
        >
          <option value="NEW">NEW</option>
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="p-4 pt-0">
      <button mat-button mat-dialog-close class="text-slate-600">Cancel</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="data.currentStatus">Apply Status</button>
    </mat-dialog-actions>
  `
})
export class BulkStatusDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BulkStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { count: number, currentStatus: TicketStatus }
  ) {}
}

@Component({
  selector: 'app-delete-ticket-list-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="flex items-center justify-between m-0 pb-3">
      <h2 mat-dialog-title class="m-0 text-base font-bold text-red-600">Delete Work Order</h2>
      <button mat-dialog-close class="text-slate-400 hover:text-slate-600 border-0 bg-transparent pr-4 pt-4 pb-0 cursor-pointer">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <mat-dialog-content>
      <div class="pt-2">
        <p class="text-sm text-slate-700">
          Are you sure you want to permanently delete ticket #<strong>{{ data.ticketNumber }}</strong>?
        </p>
        <p class="text-xs text-slate-500 mt-2">This action cannot be undone.</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="p-4 pt-0">
      <button mat-button mat-dialog-close class="text-slate-600">Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Delete Ticket</button>
    </mat-dialog-actions>
  `
})
export class DeleteTicketListDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteTicketListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ticketNumber: string }
  ) {}
}
