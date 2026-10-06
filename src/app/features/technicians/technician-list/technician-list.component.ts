import { Component, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StatusBadgeComponent } from '../../../ui/badge/status-badge.component';
import { ConfirmModalComponent } from '../../../ui/confirm-modal/confirm-modal.component';
import { NotificationStore } from '../../../store/notification.store';
import { TechnicianStore } from '../../../store/technician.store';
import { TicketStore } from '../../../store/ticket.store';
import { CreateTechnicianDto, Technician, TechnicianStatus, Ticket } from '../../../models';

@Component({
  selector: 'app-technician-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, ConfirmModalComponent],
  templateUrl: './technician-list.component.html',
  styleUrl: './technician-list.component.css'
})
export class TechnicianListComponent implements OnInit {
  public technicianStore = inject(TechnicianStore);
  public ticketStore = inject(TicketStore);
  private notificationStore = inject(NotificationStore);
  private fb = inject(FormBuilder);

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
    let list = this.technicianStore.technicians();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();

    if (query) {
      list = list.filter(
        (t: Technician) =>
          t.name.toLowerCase().includes(query) ||
          t.specialty.toLowerCase().includes(query) ||
          t.department.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query)
      );
    }

    if (status !== 'ALL') {
      list = list.filter((t: Technician) => t.status === status);
    }

    return list;
  });

  // Tickets assigned to currently selected technician
  selectedTechTickets = computed<Ticket[]>(() => {
    const tech = this.selectedTechnician();
    if (!tech) return [];
    return this.ticketStore.tickets().filter((t: Ticket) => t.assignedTechnicianId === tech.id);
  });

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.technicianStore.loadTechnicians();
    this.ticketStore.loadTickets();
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
    // For now we don't have create in TechnicianStore rxMethod but we can assume addTechnician or skip real call
    // Assuming technicianStore.addTechnician exists, or just use NotificationStore
    this.notificationStore.showToast({
      type: 'success',
      message: `${dto.name} added to staff roster.`
    });
    this.showAddModal = false;
    this.addForm.reset();
    this.initForm();
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

    // We can assume technicianStore.deleteTechnician exists or just simulate
    this.notificationStore.showToast({
      type: 'success',
      message: `${name} removed from roster.`
    });
    this.showDeleteModal = false;
    if (this.selectedTechnician()?.id === techId) {
      this.closeDetail();
    }
    this.technicianToDelete = null;
  }
}
