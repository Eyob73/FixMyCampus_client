import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReporterService } from '../../../../services/reporter.service';
import { NotificationStore } from '../../../../store/notification.store';
import { Reporter, CreateReporterRequest, UpdateReporterRequest } from '../../../../models';

export interface ReporterFormDialogData {
  reporter?: Reporter; // If supplied, edit mode; otherwise, create mode
}

@Component({
  selector: 'app-reporter-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="flex items-center justify-between p-5 pb-3 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-50 text-primary border border-blue-100 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-xl">{{ isEditMode ? 'person_edit' : 'person_add' }}</span>
        </div>
        <div>
          <h2 mat-dialog-title class="!m-0 text-base font-bold text-slate-900">
            {{ isEditMode ? 'Edit Reporter' : 'Add New Reporter' }}
          </h2>
          <p class="text-xs text-slate-500 m-0 mt-0.5">
            {{ isEditMode ? 'Update account and profile information' : 'Create a new campus reporter account' }}
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

        <!-- Name Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              First Name <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              formControlName="firstName"
              placeholder="e.g. Abebe"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              [ngClass]="{ 'border-rose-400 bg-rose-50/30': isFieldInvalid('firstName') }"
            />
            @if (isFieldInvalid('firstName')) {
              <p class="text-[11px] text-rose-600 mt-1">First name is required (min 2 characters).</p>
            }
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Last Name <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              formControlName="lastName"
              placeholder="e.g. Kebede"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              [ngClass]="{ 'border-rose-400 bg-rose-50/30': isFieldInvalid('lastName') }"
            />
            @if (isFieldInvalid('lastName')) {
              <p class="text-[11px] text-rose-600 mt-1">Last name is required (min 2 characters).</p>
            }
          </div>
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
              placeholder="Abebe.@campus.edu"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              [ngClass]="{ 'border-rose-400 bg-rose-50/30': isFieldInvalid('email') }"
            />
            @if (isFieldInvalid('email')) {
              <p class="text-[11px] text-rose-600 mt-1">Please provide a valid email address.</p>
            }
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              formControlName="phone"
              placeholder="e.g. (555) 234-5678"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <!-- Department / Affiliation -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Department / Campus Affiliation
          </label>
          <input
            type="text"
            formControlName="department"
            placeholder="e.g. Computer Science, Residence Hall, Staff"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
          />
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
                placeholder="Leave empty for auto-generated password (e.g. Reporter123!)"
                class="w-full pl-3 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
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
          [disabled]="form.invalid || isSubmitting"
          class="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          @if (isSubmitting) {
            <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>Saving...</span>
          } @else {
            <span>{{ isEditMode ? 'Update Reporter' : 'Create Reporter' }}</span>
          }
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class ReporterFormDialogComponent {
  private fb = inject(FormBuilder);
  private reporterService = inject(ReporterService);
  private notificationStore = inject(NotificationStore);
  public dialogRef = inject(MatDialogRef<ReporterFormDialogComponent>);

  public isEditMode = false;
  public isSubmitting = false;
  public showPassword = false;
  public errorMessage: string | null = null;
  public form: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ReporterFormDialogData) {
    this.isEditMode = !!data?.reporter;

    const rep = data?.reporter;
    let firstName = rep?.firstName || '';
    let lastName = rep?.lastName || '';

    if (!firstName && !lastName && rep?.name) {
      const parts = rep.name.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    this.form = this.fb.group({
      firstName: [firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [lastName, [Validators.required, Validators.minLength(2)]],
      email: [rep?.email || '', [Validators.required, Validators.email]],
      phone: [rep?.phone || ''],
      department: [rep?.department || ''],
      password: ['']
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = null;

    const val = this.form.value;

    if (this.isEditMode && this.data.reporter) {
      const updateReq: UpdateReporterRequest = {
        firstName: val.firstName.trim(),
        lastName: val.lastName.trim(),
        email: val.email.trim(),
        phone: val.phone?.trim() || undefined,
        department: val.department?.trim() || undefined
      };

      this.reporterService.updateReporter(this.data.reporter.id, updateReq).subscribe({
        next: (updated) => {
          this.isSubmitting = false;
          this.notificationStore.showToast({
            type: 'success',
            message: `Reporter ${updated.name} updated successfully.`
          });
          this.dialogRef.close(updated);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || err.error?.Message || 'Failed to update reporter. Please try again.';
        }
      });
    } else {
      const createReq: CreateReporterRequest = {
        firstName: val.firstName.trim(),
        lastName: val.lastName.trim(),
        email: val.email.trim(),
        phone: val.phone?.trim() || undefined,
        department: val.department?.trim() || undefined,
        password: val.password?.trim() || undefined
      };

      this.reporterService.createReporter(createReq).subscribe({
        next: (created) => {
          this.isSubmitting = false;
          this.notificationStore.showToast({
            type: 'success',
            message: `Reporter ${created.name} created successfully.`
          });
          this.dialogRef.close(created);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || err.error?.Message || 'Failed to create reporter. Please check fields or email uniqueness.';
        }
      });
    }
  }
}

