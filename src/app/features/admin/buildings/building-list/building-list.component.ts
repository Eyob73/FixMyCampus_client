import { Component, computed, signal, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { StatusBadgeComponent } from '../../../../ui/badge/status-badge.component';
import { ConfirmModalComponent } from '../../../../ui/confirm-modal/confirm-modal.component';
import { BuildingStore } from '../../../../store/building.store';
import { NotificationStore } from '../../../../store/notification.store';
import { TicketStore } from '../../../../store/ticket.store';
import { Building, CampusZone, CreateBuildingDto } from '../../../../models';

@Component({
  selector: 'app-building-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    StatusBadgeComponent,
    ConfirmModalComponent,
    MatDialogModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './building-list.component.html',
  styleUrl: './building-list.component.css'
})
export class BuildingListComponent implements OnInit {
  public buildingStore = inject(BuildingStore);
  public ticketStore = inject(TicketStore);
  private notificationStore = inject(NotificationStore);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  searchQuery = signal<string>('');
  zoneFilter = signal<CampusZone | 'ALL'>('ALL');
  statusFilter = signal<string>('ALL');

  // Angular Material Dialog Templates & References
  @ViewChild('addBuildingDialogTemplate') addBuildingDialogTemplate!: TemplateRef<any>;
  @ViewChild('editBuildingDialogTemplate') editBuildingDialogTemplate!: TemplateRef<any>;
  private addDialogRef: MatDialogRef<any> | null = null;
  private editDialogRef: MatDialogRef<any> | null = null;

  addForm!: FormGroup;
  editForm!: FormGroup;
  selectedBuildingForEdit: Building | null = null;

  // Delete Confirm Modal State
  showDeleteModal = false;
  buildingToDelete: Building | null = null;

  filteredBuildings = computed<Building[]>(() => {
    let list = this.buildingStore.buildings();
    const query = this.searchQuery().toLowerCase().trim();
    const zone = this.zoneFilter();
    const status = this.statusFilter();

    if (query) {
      list = list.filter(
        (b: Building) =>
          (b.name && b.name.toLowerCase().includes(query)) ||
          (b.code && b.code.toLowerCase().includes(query)) ||
          (b.managerName ? b.managerName.toLowerCase().includes(query) : false) ||
          (b.managerContact ? b.managerContact.toLowerCase().includes(query) : false)
      );
    }

    if (zone !== 'ALL') {
      list = list.filter((b: Building) => b.zone === zone);
    }

    if (status !== 'ALL') {
      list = list.filter((b: Building) => b.status === status);
    }

    return list;
  });

  ngOnInit(): void {
    this.buildingStore.loadBuildings();
    this.initAddForm();
    this.initEditForm();
  }

  private initAddForm(): void {
    this.addForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      zone: ['STEM_COMPLEX' as CampusZone, Validators.required],
      floors: [4, [Validators.required, Validators.min(1)]],
      totalRooms: [80, [Validators.required, Validators.min(1)]],
      managerName: ['', [Validators.maxLength(100)]],
      managerContact: ['', [Validators.email, Validators.maxLength(150)]],
      status: ['OPERATIONAL', Validators.required]
    });
  }

  private initEditForm(): void {
    this.editForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      zone: ['STEM_COMPLEX' as CampusZone, Validators.required],
      floors: [1, [Validators.required, Validators.min(1)]],
      totalRooms: [1, [Validators.required, Validators.min(1)]],
      managerName: ['', [Validators.maxLength(100)]],
      managerContact: ['', [Validators.email, Validators.maxLength(150)]],
      status: ['OPERATIONAL', Validators.required]
    });
  }

  refresh(): void {
    this.buildingStore.loadBuildings();
  }

  openAddModal(): void {
    this.initAddForm();
    this.addDialogRef = this.dialog.open(this.addBuildingDialogTemplate, {
      width: '580px',
      maxWidth: '92vw',
      disableClose: true,
      panelClass: ['custom-dialog-container', '!p-0']
    });
  }

  closeAddModal(): void {
    if (this.addDialogRef) {
      this.addDialogRef.close();
      this.addDialogRef = null;
    }
  }

  submitNewBuilding(): void {
    if (this.addForm.invalid) return;

    const dto: CreateBuildingDto = this.addForm.value;
    this.buildingStore.createBuilding(dto);
    this.notificationStore.showToast({
      type: 'success',
      message: `${dto.name} registered successfully.`
    });
    this.closeAddModal();
  }

  openEditModal(building: Building): void {
    this.selectedBuildingForEdit = building;
    this.editForm.patchValue({
      code: building.code,
      name: building.name,
      zone: building.zone,
      floors: building.floors,
      totalRooms: building.totalRooms,
      managerName: building.managerName,
      managerContact: building.managerContact,
      status: building.status
    });

    this.editDialogRef = this.dialog.open(this.editBuildingDialogTemplate, {
      width: '580px',
      maxWidth: '92vw',
      disableClose: true,
      panelClass: ['custom-dialog-container', '!p-0']
    });
  }

  closeEditModal(): void {
    if (this.editDialogRef) {
      this.editDialogRef.close();
      this.editDialogRef = null;
    }
    this.selectedBuildingForEdit = null;
  }

  submitEditBuilding(): void {
    if (this.editForm.invalid || !this.selectedBuildingForEdit) return;

    const partial = this.editForm.value;
    const buildingId = this.selectedBuildingForEdit.id;
    const buildingName = this.selectedBuildingForEdit.name;

    this.buildingStore.updateBuilding({ id: buildingId, partial });
    this.notificationStore.showToast({
      type: 'success',
      message: `${buildingName} facility updated.`
    });
    this.closeEditModal();
  }

  promptDelete(bld: Building): void {
    this.buildingToDelete = bld;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.buildingToDelete) return;
    const name = this.buildingToDelete.name;

    this.buildingStore.deleteBuilding(this.buildingToDelete.id);
    this.notificationStore.showToast({
      type: 'success',
      message: `${name} archived.`
    });
    this.showDeleteModal = false;
    this.buildingToDelete = null;
  }
}
