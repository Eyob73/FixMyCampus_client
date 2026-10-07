import { Component, OnInit, signal, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../../ui/badge/status-badge.component';

import { NotificationStore } from '../../../store/notification.store';
import { TechnicianStore } from '../../../store/technician.store';
import { TicketStore } from '../../../store/ticket.store';
import { Technician, Ticket, TicketPriority, TicketStatus } from '../../../models';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, MatDialogModule, MatButtonModule],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css'
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public ticketStore = inject(TicketStore);
  public technicianStore = inject(TechnicianStore);
  private notificationStore = inject(NotificationStore);
  private dialog = inject(MatDialog);

  // We can use the ticketStore.selectedTicket directly in template, or keep local signal
  // Let's use ticketStore.selectedTicket
  ticket = this.ticketStore.selectedTicket;
  isLoading = this.ticketStore.isLoading;

  // Note composer
  newNoteText = '';

  // Modals


  // Linear workflow progression steps
  readonly workflowSteps: TicketStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadTicket(id);
      }
    });
    this.technicianStore.loadTechnicians();
  }

  loadTicket(id: string): void {
    this.ticketStore.loadTicketById(id);
  }

  isStepActive(step: TicketStatus): boolean {
    const t = this.ticket();
    if (!t) return false;
    return t.status === step;
  }

  isStepCompleted(step: TicketStatus): boolean {
    const t = this.ticket();
    if (!t) return false;
    const order: Record<TicketStatus, number> = {
      NEW: 0,
      ASSIGNED: 1,
      IN_PROGRESS: 2,
      RESOLVED: 3,
      CLOSED: 4
    };
    return order[t.status] >= order[step];
  }

  openAssignModal(): void {
    const t = this.ticket();
    if (!t) return;
    const dialogRef = this.dialog.open(AssignTechnicianDialogComponent, {
      width: '450px',
      data: { technicians: this.technicianStore.technicians(), selectedTechId: t.assignedTechnicianId || '' }
    });

    dialogRef.afterClosed().subscribe((selectedTechId: string) => {
      if (selectedTechId) {
        const tech = this.technicianStore.technicians().find((x: Technician) => x.id === selectedTechId);
        if (tech) {
          this.ticketStore.assignTechnician({ id: t.id, techId: tech.id, techName: tech.name, techSpecialty: tech.specialty });
          this.notificationStore.showToast({
            type: 'success',
            message: `Work order #${t.ticketNumber} assigned to ${tech.name}.`
          });
        }
      }
    });
  }

  openStatusModal(status?: TicketStatus): void {
    const t = this.ticket();
    if (!t) return;
    
    const dialogRef = this.dialog.open(UpdateStatusDialogComponent, {
      width: '450px',
      data: { status: status || t.status || 'IN_PROGRESS', comment: '' }
    });

    dialogRef.afterClosed().subscribe((result: { status: TicketStatus, comment: string }) => {
      if (result) {
        this.ticketStore.updateTicketStatus({ id: t.id, status: result.status, note: result.comment });
        this.notificationStore.showToast({
          type: 'success',
          message: `Ticket transitioned to ${result.status}.`
        });
      }
    });
  }

  openImagePreview(url: string): void {
    this.dialog.open(ImageLightboxDialogComponent, {
      panelClass: 'lightbox-dialog',
      data: { url },
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  onPriorityChange(newPriority: TicketPriority): void {
    const t = this.ticket();
    if (!t) return;
    
    this.ticketStore.updatePriority({ id: t.id, priority: newPriority });
    
    this.notificationStore.showToast({
      type: 'success',
      message: `Severity set to ${newPriority}.`
    });
  }

  addNote(): void {
    const text = this.newNoteText.trim();
    const t = this.ticket();
    if (!text || !t) return;

    this.ticketStore.addComment({ ticketId: t.id, content: text });
    this.newNoteText = '';
    this.notificationStore.showToast({
      type: 'success',
      message: 'Internal Note Added'
    });
  }

  getTargetResolution(): string {
    const t = this.ticket();
    if (!t) return 'N/A';
    switch (t.priority) {
      case 'CRITICAL': return '< 4 Hours';
      case 'HIGH': return '< 12 Hours';
      case 'MEDIUM': return '< 48 Hours';
      case 'LOW': return 'Routine';
      default: return 'N/A';
    }
  }

  getSlaStatus(): string {
    const t = this.ticket();
    if (!t) return 'Unknown';
    if (t.status === 'CLOSED' || t.status === 'RESOLVED') return 'Met';
    return 'Within Threshold';
  }

  openDeleteModal(): void {
    const t = this.ticket();
    if (!t) return;

    const dialogRef = this.dialog.open(DeleteTicketDialogComponent, {
      width: '400px',
      data: { ticketNumber: t.ticketNumber }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.notificationStore.showToast({
          type: 'success',
          message: 'Ticket Deleted'
        });
        this.router.navigate(['/admin/tickets']);
      }
    });
  }
}

@Component({
  selector: 'app-assign-technician-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="flex items-center justify-between m-0 pb-3">
      <h2 mat-dialog-title class="m-0 text-base font-bold text-slate-900">Assign Maintenance Technician</h2>
      <button mat-dialog-close class="text-slate-400 hover:text-slate-600 border-0 bg-transparent pr-4 pt-4 pb-0 cursor-pointer">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <mat-dialog-content>
      <div class="pt-2">
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Technician</label>
        <select [(ngModel)]="data.selectedTechId" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded">
          <option value="" disabled>-- Choose a specialist --</option>
          @for (tech of data.technicians; track tech.id) {
            <option [value]="tech.id">{{ tech.name }} ({{ tech.specialty }}) - {{ tech.status }}</option>
          }
        </select>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="p-4 pt-0">
      <button mat-button mat-dialog-close class="text-slate-600">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!data.selectedTechId" [mat-dialog-close]="data.selectedTechId">Confirm Assignment</button>
    </mat-dialog-actions>
  `
})
export class AssignTechnicianDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AssignTechnicianDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { technicians: Technician[], selectedTechId: string }
  ) {}
}

@Component({
  selector: 'app-update-status-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="flex items-center justify-between m-0 pb-3">
      <h2 mat-dialog-title class="m-0 text-base font-bold text-slate-900">Update Work Order Status</h2>
      <button mat-dialog-close class="text-slate-400 hover:text-slate-600 border-0 bg-transparent pr-4 pt-4 pb-0 cursor-pointer">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <mat-dialog-content>
      <div class="pt-2 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">New Status</label>
          <select [(ngModel)]="data.status" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded">
            <option value="NEW">NEW (Unassigned)</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS (Active Repair)</option>
            <option value="RESOLVED">RESOLVED (Fixed)</option>
            <option value="CLOSED">CLOSED (Inspected & Archived)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Transition Note / Audit Comment</label>
          <textarea [(ngModel)]="data.comment" rows="2" placeholder="Add context for this status transition..." class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded"></textarea>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="p-4 pt-0">
      <button mat-button mat-dialog-close class="text-slate-600">Cancel</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="data">Save Status</button>
    </mat-dialog-actions>
  `
})
export class UpdateStatusDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UpdateStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { status: TicketStatus, comment: string }
  ) {}
}

@Component({
  selector: 'app-image-lightbox-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="relative bg-transparent p-0 m-0 overflow-hidden rounded-lg flex justify-center items-center">
      <img [src]="data.url" class="max-w-full max-h-[85vh] object-contain mx-auto shadow-2xl" />
      <button type="button" mat-dialog-close class="absolute top-3 right-3 text-white bg-slate-900/60 border-0 p-2 rounded-full cursor-pointer hover:bg-slate-900 flex">
        <span class="material-symbols-outlined text-xl">close</span>
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; background: transparent; }
  `]
})
export class ImageLightboxDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ImageLightboxDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string }
  ) {}
}

@Component({
  selector: 'app-delete-ticket-dialog',
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
          Are you sure you want to delete ticket #<strong>{{ data.ticketNumber }}</strong>?
        </p>
        <p class="text-xs text-slate-500 mt-2">This action cannot be undone.</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="p-4 pt-0">
      <button mat-button mat-dialog-close class="text-slate-600">Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `
})
export class DeleteTicketDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteTicketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ticketNumber: string }
  ) {}
}
