import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TicketService } from '../../../services/ticket.service';
import { TicketCategory, TicketPriority } from '../../../models/ticket.model';
import { MetadataService } from '../../../services/metadata.service';
import { PageContainerComponent } from '../../../layout/page-container/page-container';
import { FormFieldComponent } from '../../../components/form-field/form-field';
import { CameraCaptureDialogComponent, CameraCaptureResult } from '../../../ui/camera-capture-dialog/camera-capture-dialog.component';
import { ImageLightboxDialogComponent } from '../../../ui/image-lightbox-dialog/image-lightbox-dialog.component';

interface FilePreview {
  file: File;
  name: string;
  sizeFormatted: string;
  isImage: boolean;
  previewUrl?: string;
  isCameraCapture?: boolean;
}

@Component({
  selector: 'app-report-issue',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatDialogModule,
    MatButtonModule,
    PageContainerComponent,
    FormFieldComponent
  ],
  templateUrl: './report-issue.component.html',
  styleUrl: './report-issue.component.css'
})
export class ReportIssueComponent {
  @ViewChild('galleryInput') galleryInput?: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInput?: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private metadataService = inject(MetadataService);

  buildings = this.metadataService.buildings;
  categories = this.metadataService.categories;

  submitting = signal<boolean>(false);
  submitSuccess = signal<string | null>(null);
  submitError = signal<string | null>(null);
  selectedFiles = signal<FilePreview[]>([]);
  isDragOver = signal<boolean>(false);
  fileError = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
    category: ['', [Validators.required]],
    building: ['', [Validators.required]],
    floor: ['', [Validators.maxLength(50)]],
    room: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    priority: ['MEDIUM' as TicketPriority, [Validators.required]],
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

  isMobileDevice(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && !/Windows NT/i.test(navigator.userAgent));
  }

  takePhoto(): void {
    if (this.selectedFiles().length >= 5) {
      this.fileError.set('You have already reached the maximum limit of 5 images.');
      return;
    }

    if (this.isMobileDevice()) {
      // Mobile browsers natively open device camera via HTML5 Media Capture
      if (this.cameraInput?.nativeElement) {
        this.cameraInput.nativeElement.click();
      }
    } else {
      // Desktop browsers open interactive webcam modal with live stream, preview & retake
      this.openCameraDialog();
    }
  }

  openCameraDialog(): void {
    const dialogRef = this.dialog.open(CameraCaptureDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: {
        title: 'Take Issue Photo',
        subtitle: 'Capture a photo of the maintenance problem'
      }
    });

    dialogRef.afterClosed().subscribe((result: CameraCaptureResult | null) => {
      if (!result) return;
      if (result.action === 'choose_file') {
        this.galleryInput?.nativeElement.click();
      } else if (result.file) {
        this.addFiles([result.file], true);
      }
    });
  }

  onCameraCaptured(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.addFiles(Array.from(input.files), true);
      input.value = '';
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files), false);
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
      this.addFiles(Array.from(e.dataTransfer.files), false);
    }
  }

  addFiles(files: File[], isCamera = false): void {
    this.fileError.set(null);
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const current = this.selectedFiles();

    if (current.length >= 5) {
      this.fileError.set('You have already reached the maximum limit of 5 images.');
      return;
    }

    const newPreviews: FilePreview[] = [];
    for (const file of files) {
      if (current.length + newPreviews.length >= 5) {
        this.fileError.set('Maximum of 5 images can be attached. Extra files were ignored.');
        break;
      }

      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const isAllowedExt = allowedExts.includes(ext);
      const isAllowedMime = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';

      if (!isAllowedExt && !isAllowedMime) {
        this.fileError.set(`"${file.name}" has an unsupported format. Only JPEG, PNG, and WebP images are permitted.`);
        continue;
      }

      // Limit to 10MB
      if (file.size > 10 * 1024 * 1024) {
        this.fileError.set(`"${file.name}" exceeds the maximum allowed file size of 10 MB.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newPreviews.push({
        file,
        name: file.name,
        sizeFormatted: this.formatFileSize(file.size),
        isImage: true,
        previewUrl,
        isCameraCapture: isCamera
      });
    }

    if (newPreviews.length > 0) {
      this.selectedFiles.update((curr) => [...curr, ...newPreviews].slice(0, 5));
    }
  }

  openPreview(file: FilePreview): void {
    if (!file.previewUrl) return;
    this.dialog.open(ImageLightboxDialogComponent, {
      data: {
        url: file.previewUrl,
        fileName: file.name,
        fileSize: file.sizeFormatted,
        category: file.isCameraCapture ? 'Camera Capture' : 'Gallery Upload'
      },
      width: '750px',
      maxWidth: '92vw',
      maxHeight: '92vh'
    });
  }

  retakeFile(index: number): void {
    this.removeFile(index);
    this.takePhoto();
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
    this.fileError.set(null);
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
        floor: formValue.floor?.trim() || undefined,
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
            this.router.navigate(['/reporter/ticket', createdTicket.id]);
          }, 1200);
        },
        error: (err) => {
          this.submitting.set(false);
          const errorMsg = err?.error?.message || err?.error?.Message || 'An error occurred while submitting your ticket. Please try again.';
          this.submitError.set(errorMsg);
        }
      });
  }

  resetForm(): void {
    this.form.reset({
      title: '',
      category: '',
      building: '',
      floor: '',
      room: '',
      priority: 'MEDIUM',
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
