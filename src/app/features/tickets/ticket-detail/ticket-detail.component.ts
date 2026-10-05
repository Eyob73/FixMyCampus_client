import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../../ui/badge/status-badge.component';
import { ConfirmModalComponent } from '../../../ui/confirm-modal/confirm-modal.component';
import { NotificationService } from '../../../services/notification.service';
import { TechnicianService } from '../../../services/technician.service';
import { TicketService } from '../../../services/ticket.service';
import { Technician, Ticket, TicketPriority, TicketStatus } from '../../../models';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, ConfirmModalComponent],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css'
})
export class TicketDetailComponent implements OnInit {
  ticket = signal<Ticket | undefined>(undefined);
  isLoading = signal<boolean>(true);

  // Note composer
  newNoteText = '';

  // Modals
  showAssignModal = false;
  selectedTechId = '';
  assignComment = '';

  showStatusModal = false;
  targetStatus: TicketStatus = 'IN_PROGRESS';
  statusComment = '';

  showDeleteModal = false;

  // Selected image preview modal
  previewImageUrl: string | null = null;

  // Linear workflow progression steps
  readonly workflowSteps: TicketStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public ticketService: TicketService,
    public technicianService: TechnicianService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadTicket(id);
      }
    });
  }

  loadTicket(id: string): void {
    this.isLoading.set(true);
    this.ticketService.getTechnicianTicketById(id).subscribe({
      next: (t: Ticket) => {
        this.ticket.set(t);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Error', 'Unable to retrieve ticket details.');
      }
    });
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
    this.selectedTechId = t?.assignedTechnicianId || '';
    this.assignComment = '';
    this.showAssignModal = true;
  }

  confirmAssign(): void {
    const t = this.ticket();
    if (!t || !this.selectedTechId) return;

    const tech = this.technicianService.technicians().find((x) => x.id === this.selectedTechId);
    if (!tech) return;

    this.ticketService
      .assignTechnician(t.id, tech.id, tech.name, tech.specialty)
      .subscribe({
        next: (updated: Ticket) => {
          this.ticket.set(updated);
          this.showAssignModal = false;
          this.notificationService.success(
            'Technician Assigned',
            `Work order #${updated.ticketNumber} assigned to ${tech.name}.`
          );
        }
      });
  }

  openStatusModal(status?: TicketStatus): void {
    const t = this.ticket();
    this.targetStatus = status || t?.status || 'IN_PROGRESS';
    this.statusComment = '';
    this.showStatusModal = true;
  }

  confirmStatusUpdate(): void {
    const t = this.ticket();
    if (!t) return;

    this.ticketService
      .updateStatus(t.id, this.targetStatus, this.statusComment)
      .subscribe({
        next: (updated: Ticket) => {
          this.ticket.set(updated);
          this.showStatusModal = false;
          this.notificationService.success(
            'Status Updated',
            `Ticket transitioned to ${this.targetStatus}.`
          );
        }
      });
  }

  onPriorityChange(newPriority: TicketPriority): void {
    const t = this.ticket();
    if (!t) return;

    this.ticketService.updatePriority(t.id, newPriority).subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.notificationService.success('Priority Updated', `Severity set to ${newPriority}.`);
      }
    });
  }

  addNote(): void {
    const text = this.newNoteText.trim();
    const t = this.ticket();
    if (!text || !t) return;

    this.ticketService.addInternalNote(t.id, text).subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.newNoteText = '';
        this.notificationService.success('Internal Note Added');
      }
    });
  }

  confirmDelete(): void {
    const t = this.ticket();
    if (!t) return;

    this.ticketService.deleteTicket(t.id).subscribe({
      next: () => {
        this.notificationService.success('Ticket Deleted');
        this.router.navigate(['/admin/tickets']);
      }
    });
  }
}
