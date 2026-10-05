import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StatusBadgeComponent } from '../../../ui/badge/status-badge.component';
import { ConfirmModalComponent } from '../../../ui/confirm-modal/confirm-modal.component';
import { BuildingService } from '../../../services/building.service';
import { NotificationService } from '../../../services/notification.service';
import { TicketService } from '../../../services/ticket.service';
import { Building, CampusZone, CreateBuildingDto } from '../../../models';

@Component({
  selector: 'app-building-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, ConfirmModalComponent],
  templateUrl: './building-list.component.html',
  styleUrl: './building-list.component.css'
})
export class BuildingListComponent {
  searchQuery = signal<string>('');
  zoneFilter = signal<CampusZone | 'ALL'>('ALL');

  showAddModal = false;
  addForm!: FormGroup;

  showDeleteModal = false;
  buildingToDelete: Building | null = null;

  filteredBuildings = computed<Building[]>(() => {
    let list = this.buildingService.buildings();
    const query = this.searchQuery().toLowerCase().trim();
    const zone = this.zoneFilter();

    if (query) {
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.code.toLowerCase().includes(query) ||
          b.managerName.toLowerCase().includes(query)
      );
    }

    if (zone !== 'ALL') {
      list = list.filter((b) => b.zone === zone);
    }

    return list;
  });

  constructor(
    public buildingService: BuildingService,
    public ticketService: TicketService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.addForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2)]],
      name: ['', [Validators.required, Validators.minLength(4)]],
      zone: ['STEM_COMPLEX' as CampusZone, Validators.required],
      floors: [4, [Validators.required, Validators.min(1)]],
      totalRooms: [80, [Validators.required, Validators.min(1)]],
      managerName: ['', Validators.required],
      managerContact: ['', Validators.required]
    });
  }

  submitNewBuilding(): void {
    if (this.addForm.invalid) return;

    const dto: CreateBuildingDto = this.addForm.value;
    this.buildingService.createBuilding(dto).subscribe({
      next: (bld) => {
        this.notificationService.success('Facility Registered', `${bld.name} added to campus zones.`);
        this.showAddModal = false;
        this.addForm.reset();
        this.initForm();
      }
    });
  }

  promptDelete(bld: Building): void {
    this.buildingToDelete = bld;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.buildingToDelete) return;
    const name = this.buildingToDelete.name;

    this.buildingService.deleteBuilding(this.buildingToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('Facility Removed', `${name} archived.`);
        this.showDeleteModal = false;
        this.buildingToDelete = null;
      }
    });
  }
}
