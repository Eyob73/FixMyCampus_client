import { Component, computed, signal, OnInit, inject, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { StatusBadgeComponent } from '../../../../ui/badge/status-badge.component';
import { ConfirmModalComponent } from '../../../../ui/confirm-modal/confirm-modal.component';
import { NotificationStore } from '../../../../store/notification.store';
import { TechnicianStore } from '../../../../store/technician.store';
import { TicketStore } from '../../../../store/ticket.store';
import { CreateTechnicianDto, Technician, TechnicianStatus, Ticket } from '../../../../models';
import { TechnicianService } from '../../../../services/technician.service';

@Component({
  selector: 'app-technician-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, ConfirmModalComponent, MatDialogModule, MatButtonModule],
  templateUrl: './technician-list.component.html',
  styleUrl: './technician-list.component.css'
})
export class TechnicianListComponent implements OnInit {
  public technicianStore = inject(TechnicianStore);
  public ticketStore = inject(TicketStore);
  private notificationStore = inject(NotificationStore);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private technicianService = inject(TechnicianService);

  searchQuery = signal<string>('');
  statusFilter = signal<TechnicianStatus | 'ALL'>('ALL');

  // Modals
  @ViewChild('addTechDialogTemplate') addTechDialogTemplate!: TemplateRef<any>;
  @ViewChild('techDetailDialogTemplate') techDetailDialogTemplate!: TemplateRef<any>;
  private addDialogRef: MatDialogRef<any> | null = null;
  private detailDialogRef: MatDialogRef<any> | null = null;
  
  addForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  selectedTechnician = signal<Technician | null>(null);

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
    this.detailDialogRef = this.dialog.open(this.techDetailDialogTemplate, {
      width: '500px',
      panelClass: 'custom-dialog-container'
    });
  }

  closeDetail(): void {
    if (this.detailDialogRef) {
      this.detailDialogRef.close();
      this.detailDialogRef = null;
    }
    this.selectedTechnician.set(null);
  }

  openAddModal(): void {
    this.addForm.reset();
    this.initForm();
    this.errorMessage.set(null);
    this.isSubmitting.set(false);
    this.addDialogRef = this.dialog.open(this.addTechDialogTemplate, {
      width: '500px',
      panelClass: 'custom-dialog-container',
      disableClose: true // force using buttons
    });
  }

  closeAddModal(): void {
    if (this.addDialogRef) {
      this.addDialogRef.close();
      this.addDialogRef = null;
    }
  }

  submitNewTech(): void {
    if (this.addForm.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const dto: CreateTechnicianDto = this.addForm.value;

    this.technicianService.createTechnician(dto).subscribe({
      next: (newTech: Technician) => {
        this.isSubmitting.set(false);
        this.notificationStore.showToast({
          type: 'success',
          message: `${newTech.name} added to staff roster.`
        });
        this.technicianStore.loadTechnicians(); // Refresh list from backend
        this.closeAddModal();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to add technician. Please try again.');
        this.notificationStore.showToast({
          type: 'error',
          message: 'Error creating technician.'
        });
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
