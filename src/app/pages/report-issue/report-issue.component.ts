import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TicketService } from '../../core/services/ticket.service';
import { TicketCategory, TicketPriority } from '../../core/models/ticket.model';
import { CAMPUS_BUILDINGS, TICKET_CATEGORIES } from '../../core/services/mock-data';
import { PageContainerComponent } from '../../layout/page-container/page-container';
import { FormFieldComponent } from '../../components/form-field/form-field';

interface FilePreview {
  file: File;
  name: string;
  sizeFormatted: string;
  isImage: boolean;
  previewUrl?: string;
}

@Component({
  selector: 'app-report-issue',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PageContainerComponent,
    FormFieldComponent
  ],
  templateUrl: './report-issue.component.html',
  styleUrl: './report-issue.component.css'
})
export class ReportIssueComponent {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private router = inject(Router);

  buildings = CAMPUS_BUILDINGS;
  categories = TICKET_CATEGORIES;

  submitting = signal<boolean>(false);
  submitSuccess = signal<string | null>(null);
  submitError = signal<string | null>(null);
  selectedFiles = signal<FilePreview[]>([]);
  isDragOver = signal<boolean>(false);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
    category: ['', [Validators.required]],
    building: ['', [Validators.required]],
    room: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    priority: ['medium' as TicketPriority, [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(15), Validators.maxLength(2000)]],
    additionalDetails: ['']
  });

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control || !control.errors) return '';
    if (control.errors['required']) return 'This field is required.';
    if (control.errors['minlength']) {
      return `Must be at least ${control.errors['minlength'].requiredLength} characters.`;
    }
    if (control.errors['maxlength']) {
      return `Cannot exceed ${control.errors['maxlength'].requiredLength} characters.`;
    }
    return 'Invalid input.';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver.set(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      this.addFiles(Array.from(e.dataTransfer.files));
    }
  }

  private addFiles(files: File[]): void {
    const newPreviews: FilePreview[] = [];
    for (const file of files) {
      // Limit to 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      const isImage = file.type.startsWith('image/');
      let previewUrl: string | undefined;
      if (isImage) {
        previewUrl = URL.createObjectURL(file);
      }

      newPreviews.push({
        file,
        name: file.name,
        sizeFormatted: this.formatFileSize(file.size),
        isImage,
        previewUrl
      });
    }

    this.selectedFiles.update((current) => [...current, ...newPreviews].slice(0, 5));
  }

  removeFile(index: number): void {
    this.selectedFiles.update((list) => {
      const copy = [...list];
      const removed = copy.splice(index, 1);
      if (removed[0]?.previewUrl) {
        URL.revokeObjectURL(removed[0].previewUrl);
      }
      return copy;
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError.set('Please fill out all required fields marked in red.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(null);

    const formValue = this.form.value;
    const filesToUpload = this.selectedFiles().map((p) => p.file);

    this.ticketService
      .createTicket({
        title: formValue.title!,
        category: formValue.category as TicketCategory,
        building: formValue.building!,
        room: formValue.room!,
        priority: formValue.priority as TicketPriority,
        description: formValue.description!,
        additionalDetails: formValue.additionalDetails || undefined,
        attachments: filesToUpload
      })
      .subscribe({
        next: (createdTicket) => {
          this.submitting.set(false);
          this.submitSuccess.set(
            `Issue #${createdTicket.id} submitted successfully! Redirecting to ticket details...`
          );

          // Clear form
          this.resetForm();

          // Redirect to ticket details page after brief moment
          setTimeout(() => {
            this.router.navigate(['/ticket', createdTicket.id]);
          }, 1200);
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(
            'An error occurred while submitting your ticket. Please try again.'
          );
        }
      });
  }

  resetForm(): void {
    this.form.reset({
      title: '',
      category: '',
      building: '',
      room: '',
      priority: 'medium',
      description: '',
      additionalDetails: ''
    });

    // Clean up preview URLs
    for (const f of this.selectedFiles()) {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    }
    this.selectedFiles.set([]);
    this.submitError.set(null);
  }

  onCancel(): void {
    if (this.form.dirty) {
      if (confirm('Discard changes and leave the form?')) {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
