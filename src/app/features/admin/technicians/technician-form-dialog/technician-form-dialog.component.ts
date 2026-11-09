import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TechnicianService } from '../../../../services/technician.service';
import { NotificationStore } from '../../../../store/notification.store';
import { Technician, CreateTechnicianDto, UpdateTechnicianDto, TechnicianStatus } from '../../../../models';

export interface TechnicianFormDialogData {
  technician?: Technician; // If supplied, edit mode; otherwise, create mode
}

@Component({
  selector: 'app-technician-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="flex items-center justify-between p-5 pb-3 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-50 text-primary border border-blue-100 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-xl">{{ isEditMode ? 'engineering' : 'person_add' }}</span>
        </div>
        <div>
          <h2 mat-dialog-title class="!m-0 text-base font-bold text-slate-900">
            {{ isEditMode ? 'Edit Technician' : 'Add New Technician' }}
          </h2>
          <p class="text-xs text-slate-500 m-0 mt-0.5">
            {{ isEditMode ? 'Update staff profile and trade specialty' : 'Register a new maintenance technician' }}
          </p>
        </div>
      </div>
      <button
        mat-dialog-close
        type="button"
        class="text-slate-400 hover:text-slate-600 border-0 bg-transparent p-1.5 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Close dialog"
      >
        <span class="material-symbols-outlined text-xl">close</span>
      </button>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="!p-5 space-y-4">
        <!-- Error Alert -->
        @if (errorMessage) {
          <div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <span class="material-symbols-outlined text-base shrink-0">error</span>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <!-- Full Name -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Full Name <span class="text-rose-500">*</span>
          </label>
          <input
            type="text"
            formControlName="name"
            placeholder="e.g. Alex Morgan"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
            [ngClass]="{ 'border-rose-400 bg-rose-50/30': isFieldInvalid('name') }"
          />
          @if (isFieldInvalid('name')) {
            <p class="text-[11px] text-rose-600 mt-1">Full name is required (min 2 characters).</p>
          }
        </div>

        <!-- Email & Phone Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span class="text-rose-500">*</span>
            </label>
            <input
              type="email"
              formControlName="email"
              placeholder="alex.morgan@campus.edu"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              [ngClass]="{ 'border-rose-400 bg-rose-50/30': isFieldInvalid('email') }"
            />
            @if (isFieldInvalid('email')) {
              <p class="text-[11px] text-rose-600 mt-1">A valid email address is required.</p>
            }
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span class="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              formControlName="phone"
              placeholder="e.g. +1 (555) 234-5678"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              [ngClass]="{ 'border-rose-400 bg-rose-50/30': isFieldInvalid('phone') }"
            />
            @if (isFieldInvalid('phone')) {
              <p class="text-[11px] text-rose-600 mt-1">Contact phone number is required.</p>
            }
          </div>
        </div>

        <!-- Department & Specialty Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Department <span class="text-rose-500">*</span>
            </label>
            <select
              formControlName="department"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="HVAC & Climate Systems">HVAC & Climate Systems</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Plumbing & Water">Plumbing & Water</option>
              <option value="Structural & Carpentry">Structural & Carpentry</option>
              <option value="IT & Network Infrastructure">IT & Network Infrastructure</option>
              <option value="General Maintenance">General Maintenance</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Primary Specialty <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              formControlName="specialty"
              placeholder="e.g. HVAC Specialist, Master Electrician"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              [ngClass]="{ 'border-rose-400 bg-rose-50/30': isFieldInvalid('specialty') }"
            />
            @if (isFieldInvalid('specialty')) {
              <p class="text-[11px] text-rose-600 mt-1">Specialty description is required.</p>
            }
          </div>
        </div>

        <!-- Initial Status -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Account Status <span class="text-rose-500">*</span>
          </label>
          <select
            formControlName="status"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="AVAILABLE">Available (Ready for work orders)</option>
            <option value="BUSY">Busy (Under assignment)</option>
            <option value="ON_CALL">On Call (Emergency dispatch)</option>
            <option value="OFF_DUTY">Off Duty (Inactive)</option>
          </select>
        </div>

        <!-- Password (Create Mode only) -->
        @if (!isEditMode) {
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Initial Password
            </label>
            <div class="relative">
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="Leave empty for auto-generated password (e.g. Tech123!)"
                class="w-full pl-3 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                [ngClass]="{ 'border-rose-400 bg-rose-50/30': isFieldInvalid('password') }"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0 transition-colors"
                [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
              >
                <span class="material-symbols-outlined text-base">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            @if (isFieldInvalid('password')) {
              <p class="text-[11px] text-rose-600 mt-1">Password must be at least 6 characters.</p>
            }
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="!px-5 !py-3 border-t border-slate-100 !m-0 !flex !items-center !justify-end gap-2">
        <button
          mat-button
          mat-dialog-close
          type="button"
          [disabled]="isSubmitting"
          class="text-xs font-semibold !text-slate-600 hover:!bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          [disabled]="isSubmitting || form.invalid"
          class="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          @if (isSubmitting) {
            <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>{{ isEditMode ? 'Saving...' : 'Creating...' }}</span>
          } @else {
            <span class="material-symbols-outlined text-sm">{{ isEditMode ? 'save' : 'check' }}</span>
            <span>{{ isEditMode ? 'Save Changes' : 'Create Technician' }}</span>
          }
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class TechnicianFormDialogComponent {
  private fb = inject(FormBuilder);
  private technicianService = inject(TechnicianService);
  private notificationStore = inject(NotificationStore);
  public dialogRef = inject(MatDialogRef<TechnicianFormDialogComponent>);

  public isEditMode = false;
  public isSubmitting = false;
  public showPassword = false;
  public errorMessage: string | null = null;
  public form!: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: TechnicianFormDialogData) {
    this.isEditMode = !!data?.technician;
    this.initForm();
  }

  private initForm(): void {
    const tech = this.data?.technician;

    this.form = this.fb.group({
      name: [tech?.name || '', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      email: [tech?.email || '', [Validators.required, Validators.email, Validators.maxLength(256)]],
      phone: [tech?.phone || '', [Validators.required, Validators.maxLength(25)]],
      department: [tech?.department || 'HVAC & Climate Systems', [Validators.required, Validators.maxLength(100)]],
      specialty: [tech?.specialty || '', [Validators.required, Validators.maxLength(100)]],
      status: [tech?.status || 'AVAILABLE', [Validators.required]],
      password: ['', [Validators.minLength(6), Validators.maxLength(100)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const val = this.form.value;

    if (this.isEditMode && this.data.technician) {
      const payload: Partial<CreateTechnicianDto> = {
        name: val.name.trim(),
        email: val.email.trim(),
        phone: val.phone?.trim(),
        department: val.department?.trim(),
        specialty: val.specialty?.trim(),
        status: val.status as TechnicianStatus
      };

      this.technicianService.updateTechnician(this.data.technician.id, payload).subscribe({
        next: (updatedTech) => {
          this.isSubmitting = false;
          this.notificationStore.showToast({
            type: 'success',
            message: `Technician ${updatedTech.name} updated successfully.`
          });
          this.dialogRef.close(updatedTech);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || err.error?.Message || 'Failed to update technician.';
        }
      });
    } else {
      const payload: CreateTechnicianDto = {
        name: val.name.trim(),
        email: val.email.trim(),
        phone: val.phone?.trim(),
        department: val.department?.trim(),
        specialty: val.specialty?.trim(),
        status: val.status as TechnicianStatus,
        password: val.password ? val.password.trim() : undefined
      };

      this.technicianService.createTechnician(payload).subscribe({
        next: (newTech) => {
          this.isSubmitting = false;
          this.notificationStore.showToast({
            type: 'success',
            message: `Technician ${newTech.name} created successfully.`
          });
          this.dialogRef.close(newTech);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || err.error?.Message || 'Failed to create technician.';
        }
      });
    }
  }
}

