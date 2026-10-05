import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuildingService } from '../../services/building.service';
import { NotificationService } from '../../services/notification.service';
import { TechnicianService } from '../../services/technician.service';
import { TicketService } from '../../services/ticket.service';
import { CreateTicketDto, TicketCategory, TicketPriority } from '../../models';

@Component({
  selector: 'app-ticket-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-fade-in">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-xl">confirmation_number</span>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900">Create New Campus Work Order</h3>
                <p class="text-xs text-slate-500">Dispatch physical plant maintenance ticket</p>
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
                  @for (b of buildingService.buildings(); track b.id) {
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
                @for (tech of technicianService.technicians(); track tech.id) {
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

            <!-- Actions Footer -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                (click)="onClose()"
                class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="form.invalid || isSubmitting"
                class="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
              >
                {{ isSubmitting ? 'Creating Work Order...' : 'Dispatch Ticket' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class TicketCreateModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public buildingService: BuildingService,
    public technicianService: TechnicianService,
    private ticketService: TicketService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const defaultBuilding = this.buildingService.buildings()[0]?.name || 'Physical Sciences Hall & Labs';
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

  onClose(): void {
    this.form.reset();
    this.initForm();
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
      assignedTechnicianId: val.assignedTechnicianId || undefined
    };

    this.ticketService.createTicket(dto).subscribe({
      next: (ticket) => {
        this.isSubmitting = false;
        this.notificationService.success(
          'Ticket Created Successfully',
          `Work order #${ticket.ticketNumber} has been dispatched.`
        );
        this.onClose();
      },
      error: () => {
        this.isSubmitting = false;
        this.notificationService.error('Failed to create ticket', 'Please review input details and retry.');
      }
    });
  }
}
