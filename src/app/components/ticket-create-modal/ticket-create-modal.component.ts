import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, TemplateRef, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BuildingStore } from '../../store/building.store';
import { NotificationStore } from '../../store/notification.store';
import { TechnicianStore } from '../../store/technician.store';
import { TicketService } from '../../services/ticket.service';
import { TicketStore } from '../../store/ticket.store';
import { CreateTicketDto, TicketCategory, TicketPriority } from '../../models';
import { CameraCaptureDialogComponent, CameraCaptureResult } from '../../ui/camera-capture-dialog/camera-capture-dialog.component';

@Component({
  selector: 'app-ticket-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  template: `
    <ng-template #dialogTemplate>
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-blue-100 text-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-xl">confirmation_number</span>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 m-0 leading-tight">Create New Campus Work Order</h3>
            <p class="text-xs text-slate-500 m-0">Dispatch physical plant maintenance ticket</p>
          </div>
        </div>
        <button
          type="button"
          (click)="onClose()"
          class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <mat-dialog-content class="!p-0">
        <!-- Form Body -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Issue Summary / Title <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              formControlName="title"
              placeholder="e.g. Broken hydronic pipe leaking into sub-floor"
              class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
            />
            @if (form.get('title')?.touched && form.get('title')?.invalid) {
              <p class="text-xs text-rose-500 mt-1">Title is required (minimum 5 characters).</p>
            }
          </div>

          <!-- Category & Priority Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category <span class="text-rose-500">*</span>
              </label>
              <select
                formControlName="category"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="HVAC">HVAC & Climate Systems</option>
                <option value="PLUMBING">Plumbing & Hydronics</option>
                <option value="ELECTRICAL">Electrical & Power Distribution</option>
                <option value="STRUCTURAL">Structural, Doors & Roofing</option>
                <option value="IT_SECURITY">Access Control & Security</option>
                <option value="GENERAL">General Maintenance</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Severity Priority <span class="text-rose-500">*</span>
              </label>
              <select
                formControlName="priority"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="LOW">Low (Routine)</option>
                <option value="MEDIUM">Medium (Scheduled)</option>
                <option value="HIGH">High (Urgent Escalation)</option>
                <option value="CRITICAL">Critical (Immediate Danger / Outage)</option>
              </select>
            </div>
          </div>

          <!-- Building & Location Details -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-1">
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Building <span class="text-rose-500">*</span>
              </label>
              <select
                formControlName="building"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              >
                @for (b of buildingStore.buildings(); track b.id) {
                  <option [value]="b.name">{{ b.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Floor</label>
              <input
                type="text"
                formControlName="floor"
                placeholder="e.g. 2nd Floor"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Room / Area</label>
              <input
                type="text"
                formControlName="room"
                placeholder="e.g. Room 204"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <!-- Assign Technician -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assign Maintenance Technician
            </label>
            <select
              formControlName="assignedTechnicianId"
              class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Unassigned (Send to Queue) --</option>
              @for (tech of technicianStore.technicians(); track tech.id) {
                <option [value]="tech.id">
                  {{ tech.name }} ({{ tech.specialty }}) - {{ tech.status }}
                </option>
              }
            </select>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Scope of Work <span class="text-rose-500">*</span>
            </label>
            <textarea
              rows="3"
              formControlName="description"
              placeholder="Specify root cause, equipment tags, safety precautions, or observed damage..."
              class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
            ></textarea>
            @if (form.get('description')?.touched && form.get('description')?.invalid) {
              <p class="text-xs text-rose-500 mt-1">Please provide descriptive details (min 10 chars).</p>
            }
          </div>

          <!-- Attach Images Section -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Attach Images (Optional, max 5)
            </label>
            <div class="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50">
              <input
                #modalGalleryInput
                type="file"
                (change)="onFilesSelected($event)"
                accept="image/jpeg,image/png,image/webp"
                multiple
                class="hidden"
              />
              <input
                #modalCameraInput
                type="file"
                (change)="onCameraCaptured($event)"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                class="hidden"
              />
              <div class="flex items-center justify-center gap-2">
                <button
                  type="button"
                  (click)="takePhoto()"
                  class="px-3 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1E3A8A] border border-[#BFDBFE] rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[16px]">photo_camera</span>
                  <span>Take Photo</span>
                </button>
                <button
                  type="button"
                  (click)="modalGalleryInput.click()"
                  class="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[16px]">photo_library</span>
                  <span>Upload from Gallery</span>
                </button>
              </div>
              <p class="text-[10px] text-slate-500 mt-1.5">JPEG, PNG, or WebP up to 10MB each</p>
            </div>

            @if (fileError) {
              <p class="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">error</span>
                {{ fileError }}
              </p>
            }

            @if (selectedPreviews.length > 0) {
              <div class="grid grid-cols-3 gap-2 mt-2">
                @for (item of selectedPreviews; track $index) {
                  <div class="relative group rounded border border-slate-200 overflow-hidden bg-white">
                    <img [src]="item.previewUrl" [alt]="item.file.name" class="w-full h-16 object-cover" />
                    <button
                      type="button"
                      (click)="removeFile($index)"
                      class="absolute top-1 right-1 w-5 h-5 bg-slate-900/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs"
                      title="Remove"
                    >
                      <span class="material-symbols-outlined text-[12px]">close</span>
                    </button>
                    <p class="text-[10px] text-slate-600 truncate p-1">{{ item.file.name }}</p>
                  </div>
                }
              </div>
            }
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="border-t border-slate-200 !p-4 !m-0">
        <button mat-button (click)="onClose()" class="text-slate-700 font-medium">
          Cancel
        </button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="form.invalid || isSubmitting"
          (click)="onSubmit()"
        >
          {{ isSubmitting ? 'Creating Work Order...' : 'Dispatch Ticket' }}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `
})
export class TicketCreateModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('modalGalleryInput') modalGalleryInput?: ElementRef<HTMLInputElement>;
  @ViewChild('modalCameraInput') modalCameraInput?: ElementRef<HTMLInputElement>;
  private dialog = inject(MatDialog);
  private dialogRef: MatDialogRef<any> | null = null;

  form!: FormGroup;
  isSubmitting = false;
  selectedFiles: File[] = [];
  selectedPreviews: Array<{ file: File; previewUrl: string }> = [];
  fileError: string | null = null;

  readonly buildingStore = inject(BuildingStore);
  readonly technicianStore = inject(TechnicianStore);
  private readonly ticketStore = inject(TicketStore);
  private readonly notificationStore = inject(NotificationStore);

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen && !this.dialogRef) {
        setTimeout(() => {
          this.dialogRef = this.dialog.open(this.dialogTemplate, {
            width: '600px',
            maxWidth: '90vw',
            disableClose: true,
            panelClass: ['custom-dialog-container', '!p-0']
          });
        });
      } else if (!this.isOpen && this.dialogRef) {
        this.dialogRef.close();
        this.dialogRef = null;
      }
    }
  }

  private initForm(): void {
    const defaultBuilding = this.buildingStore.buildings()[0]?.name || '';
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['HVAC' as TicketCategory, Validators.required],
      priority: ['MEDIUM' as TicketPriority, Validators.required],
      building: [defaultBuilding, Validators.required],
      floor: [''],
      room: [''],
      assignedTechnicianId: ['']
    });
  }

  isMobileDevice(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && !/Windows NT/i.test(navigator.userAgent));
  }

  takePhoto(): void {
    if (this.selectedFiles.length >= 5) {
      this.fileError = 'Maximum of 5 images allowed.';
      return;
    }

    if (this.isMobileDevice()) {
      if (this.modalCameraInput?.nativeElement) {
        this.modalCameraInput.nativeElement.click();
      }
    } else {
      this.openCameraDialog();
    }
  }

  openCameraDialog(): void {
    const dialogRef = this.dialog.open(CameraCaptureDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: {
        title: 'Take Work Order Photo',
        subtitle: 'Capture a photo of the maintenance location or issue'
      }
    });

    dialogRef.afterClosed().subscribe((result: CameraCaptureResult | null) => {
      if (!result) return;
      if (result.action === 'choose_file') {
        this.modalGalleryInput?.nativeElement.click();
      } else if (result.file) {
        this.addFiles([result.file]);
      }
    });
  }

  onCameraCaptured(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.addFiles(Array.from(input.files));
    input.value = '';
  }

  addFiles(files: File[]): void {
    this.fileError = null;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;

    for (const file of files) {
      if (this.selectedFiles.length >= maxFiles) {
        this.fileError = 'Maximum of 5 images allowed.';
        break;
      }

      if (!allowed.includes(file.type)) {
        this.fileError = `File "${file.name}" has an unsupported format. Only JPEG, PNG, and WebP are allowed.`;
        continue;
      }

      if (file.size > maxFileSize) {
        this.fileError = `File "${file.name}" exceeds the 10 MB size limit.`;
        continue;
      }

      this.selectedFiles.push(file);
      this.selectedPreviews.push({
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }
  }

  removeFile(index: number): void {
    const removed = this.selectedPreviews.splice(index, 1);
    if (removed[0]?.previewUrl) {
      URL.revokeObjectURL(removed[0].previewUrl);
    }
    this.selectedFiles.splice(index, 1);
    this.fileError = null;
  }

  private clearFiles(): void {
    for (const item of this.selectedPreviews) {
      URL.revokeObjectURL(item.previewUrl);
    }
    this.selectedPreviews = [];
    this.selectedFiles = [];
    this.fileError = null;
  }

  onClose(): void {
    this.form.reset();
    this.initForm();
    this.clearFiles();
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const val = this.form.value;

    const dto: CreateTicketDto = {
      title: val.title,
      description: val.description,
      category: val.category,
      priority: val.priority,
      building: val.building,
      floor: val.floor || undefined,
      room: val.room || undefined,
      assignedTechnicianId: val.assignedTechnicianId || undefined,
      attachments: this.selectedFiles.length > 0 ? this.selectedFiles : undefined
    };

    this.ticketService.createTicket(dto).subscribe({
      next: (ticket) => {
        this.isSubmitting = false;
        this.notificationStore.showToast({
          type: 'success',
          message: `Work order #${ticket.ticketNumber} has been dispatched.`
        });
        this.ticketStore.loadTickets(); // refresh store
        this.onClose();
      },
      error: () => {
        this.isSubmitting = false;
        this.notificationStore.showToast({
          type: 'error',
          message: 'Please review input details and retry.'
        });
      }
    });
  }
}
