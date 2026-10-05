import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StatusBadgeComponent } from '../../../ui/badge/status-badge.component';
import { ConfirmModalComponent } from '../../../ui/confirm-modal/confirm-modal.component';
import { NotificationService } from '../../../services/notification.service';
import { TechnicianService } from '../../../services/technician.service';
import { TicketService } from '../../../services/ticket.service';
import { CreateTechnicianDto, Technician, TechnicianStatus, Ticket } from '../../../models';

@Component({
  selector: 'app-technician-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, ConfirmModalComponent],
  templateUrl: './technician-list.component.html',
  styleUrl: './technician-list.component.css'
})
export class TechnicianListComponent {
  searchQuery = signal<string>('');
  statusFilter = signal<TechnicianStatus | 'ALL'>('ALL');

  // Modals
  showAddModal = false;
  addForm!: FormGroup;

  selectedTechnician = signal<Technician | null>(null);
  showDetailDrawer = false;

  showDeleteModal = false;
  technicianToDelete: Technician | null = null;

  filteredTechnicians = computed<Technician[]>(() => {
    let list = this.technicianService.technicians();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();

    if (query) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.specialty.toLowerCase().includes(query) ||
          t.department.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query)
      );
    }

    if (status !== 'ALL') {
      list = list.filter((t) => t.status === status);
    }

    return list;
  });

  // Tickets assigned to currently selected technician
  selectedTechTickets = computed<Ticket[]>(() => {
    const tech = this.selectedTechnician();
    if (!tech) return [];
    return this.ticketService.tickets().filter((t) => t.assignedTechnicianId === tech.id);
  });

  constructor(
    public technicianService: TechnicianService,
    public ticketService: TicketService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.addForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      department: ['HVAC & Climate Systems', Validators.required],
      specialty: ['', Validators.required],
      status: ['AVAILABLE' as TechnicianStatus, Validators.required]
    });
  }

  openDetail(tech: Technician): void {
    this.selectedTechnician.set(tech);
    this.showDetailDrawer = true;
  }

  closeDetail(): void {
    this.showDetailDrawer = false;
    this.selectedTechnician.set(null);
  }

  submitNewTech(): void {
    if (this.addForm.invalid) return;

    const dto: CreateTechnicianDto = this.addForm.value;
    this.technicianService.createTechnician(dto).subscribe({
      next: (tech) => {
        this.notificationService.success('Technician Added', `${tech.name} added to staff roster.`);
        this.showAddModal = false;
        this.addForm.reset();
        this.initForm();
      }
    });
  }

  promptDelete(tech: Technician, event: Event): void {
    event.stopPropagation();
    this.technicianToDelete = tech;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.technicianToDelete) return;
    const techId = this.technicianToDelete.id;
    const name = this.technicianToDelete.name;

    this.technicianService.deleteTechnician(techId).subscribe({
      next: () => {
        this.notificationService.success('Technician Removed', `${name} removed from roster.`);
        this.showDeleteModal = false;
        if (this.selectedTechnician()?.id === techId) {
          this.closeDetail();
        }
        this.technicianToDelete = null;
      }
    });
  }
}
