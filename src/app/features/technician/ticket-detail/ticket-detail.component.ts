import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TicketService } from '../../../services/ticket.service';
import { TicketStore } from '../../../store/ticket.store';
import { AuthService } from '../../../services/auth.service';
import { NotificationStore } from '../../../store/notification.store';
import {
  Ticket,
  TicketStatus,
  TicketAttachment,
} from '../../../models/ticket.model';

type WorkNoteType = 'DIAGNOSIS' | 'WORK_PERFORMED' | 'MATERIALS_REQUIRED' | 'DELAY_REASON' | 'GENERAL';
import { StatusBadge } from '../../../components/status-badge/status-badge';
import { PriorityBadge } from '../../../components/priority-badge/priority-badge.component';
import { ConfirmModalComponent } from '../../../components/confirm-modal/confirm-modal.component';
import { PageContainerComponent } from '../../../layout/page-container/page-container';
import { ImageLightboxDialogComponent } from '../../../ui/image-lightbox-dialog/image-lightbox-dialog.component';
import { CameraCaptureDialogComponent, CameraCaptureResult } from '../../../ui/camera-capture-dialog/camera-capture-dialog.component';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadge, PriorityBadge, ConfirmModalComponent, PageContainerComponent],
  templateUrl: './ticket-detail.component.html',
})
export class TicketDetailComponent implements OnInit {
  @ViewChild('evidenceGalleryInput') evidenceGalleryInput?: ElementRef<HTMLInputElement>;
  @ViewChild('evidenceCameraInput') evidenceCameraInput?: ElementRef<HTMLInputElement>;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly ticketService = inject(TicketService);
  readonly ticketStore = inject(TicketStore);
  readonly authService = inject(AuthService);
  private readonly notificationStore = inject(NotificationStore);
  private readonly dialog = inject(MatDialog);

  readonly ticket = this.ticketStore.selectedTicket;
  readonly loading = signal<boolean>(false);
  readonly actionLoading = signal<boolean>(false);
  readonly submittingNote = signal<boolean>(false);
  readonly submittingResolution = signal<boolean>(false);
  readonly uploadingEvidence = signal<boolean>(false);

  // Manual status select
  manualStatusSelect: TicketStatus = 'ASSIGNED';

  // Work note input
  newNoteType: WorkNoteType = 'DIAGNOSIS';
  newNoteContent = '';

  // Staged resolution evidence files (multi-image support)
  stagedEvidencePreviews = signal<Array<{ file: File; name: string; sizeFormatted: string; previewUrl: string; isCameraCapture?: boolean }>>([]);
  evidenceUploadError = signal<string | null>(null);

  // Resolution modal
  showResolutionModal = false;
  resolutionError = false;
  resolutionForm = {
    description: '',
    workPerformed: '',
    materialsUsed: '',
    additionalNotes: '',
  };

  // Confirm start work modal
  confirmStartModalOpen = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.fetchTicket(id);
      }
    });
  }

  fetchTicket(id: string): void {
    this.loading.set(true);
    this.ticketService.getTicketById(id).subscribe({
      next: (ticket) => {
        if (ticket) {
          this.manualStatusSelect = ticket.status;
        }
        // Actually, we can use ticketStore for fetching:
        this.ticketStore.loadTicketById(id);
        this.loading.set(false);
      },
      error: () => {
        this.notificationStore.showToast({ type: 'error', message: `Failed to load Ticket #${id}.` });
        this.loading.set(false);
      },
    });
  }

  get reporterAttachments(): TicketAttachment[] {
    return (this.ticket()?.attachments || []).filter(a => a.category !== 'ResolutionEvidence');
  }

  get evidenceAttachments(): TicketAttachment[] {
    return (this.ticket()?.attachments || []).filter(a => a.category === 'ResolutionEvidence');
  }

  get sortedActivities() {
    const list = [...(this.ticket()?.activityLog || [])];
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  confirmStartWork(): void {
    this.confirmStartModalOpen = true;
  }

  executeStartWork(): void {
    const current = this.ticket();
    if (!current) return;

    this.actionLoading.set(true);
    this.ticketService
      .updateStatus(current.id, 'IN_PROGRESS', 'Technician arrived on site and began diagnostic/repair procedures.')
      .subscribe({
        next: () => {
          this.notificationStore.showToast({ type: 'success', message: `Ticket #${current.id} transitioned to IN PROGRESS.` });
          this.ticketStore.loadTicketById(current.id);
          this.actionLoading.set(false);
          this.confirmStartModalOpen = false;
          this.manualStatusSelect = 'IN_PROGRESS';
        },
        error: () => {
          this.notificationStore.showToast({ type: 'error', message: `Failed to update ticket status.` });
          this.actionLoading.set(false);
        },
      });
  }

  applyManualStatus(): void {
    const current = this.ticket();
    if (!current || this.manualStatusSelect === current.status) return;

    if (this.manualStatusSelect === 'RESOLVED') {
      this.openResolutionModal();
      return;
    }

    this.actionLoading.set(true);
    this.ticketService
      .updateStatus(current.id, this.manualStatusSelect, `Technician updated status to ${this.manualStatusSelect}.`)
      .subscribe({
        next: () => {
          this.notificationStore.showToast({ type: 'success', message: `Ticket #${current.id} status updated to ${this.manualStatusSelect}.` });
          this.ticketStore.loadTicketById(current.id);
          this.actionLoading.set(false);
        },
        error: () => {
          this.notificationStore.showToast({ type: 'error', message: `Failed to update ticket status.` });
          this.actionLoading.set(false);
        },
      });
  }

  submitWorkNote(): void {
    const current = this.ticket();
    if (!current || !this.newNoteContent.trim()) return;

    this.submittingNote.set(true);
    this.ticketService.addWorkNote(current.id, this.newNoteContent.trim(), this.newNoteType).subscribe({
      next: () => {
        this.notificationStore.showToast({ type: 'success', message: 'Work note logged successfully.' });
        this.ticketStore.loadTicketById(current.id);
        this.newNoteContent = '';
        this.submittingNote.set(false);
      },
      error: () => {
        this.notificationStore.showToast({ type: 'error', message: 'Failed to log work note.' });
        this.submittingNote.set(false);
      },
    });
  }

  openResolutionModal(): void {
    this.resolutionForm = {
      description: '',
      workPerformed: '',
      materialsUsed: '',
      additionalNotes: '',
    };
    this.resolutionError = false;
    this.showResolutionModal = true;
  }

  closeResolutionModal(): void {
    this.showResolutionModal = false;
    this.resolutionError = false;
  }

  submitResolution(): void {
    if (!this.resolutionForm.description.trim() || !this.resolutionForm.workPerformed.trim()) {
      this.resolutionError = true;
      return;
    }

    const current = this.ticket();
    if (!current) return;

    this.submittingResolution.set(true);
    this.ticketService
      .resolveTicket(current.id, {
        resolutionDescription: this.resolutionForm.description.trim(),
        workPerformed: this.resolutionForm.workPerformed.trim(),
        materialsUsed: this.resolutionForm.materialsUsed.trim() || undefined,
        additionalNotes: this.resolutionForm.additionalNotes.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.notificationStore.showToast({ type: 'success', message: `Ticket #${current.id} has been resolved!` });
          this.ticketStore.loadTicketById(current.id);
          this.submittingResolution.set(false);
          this.showResolutionModal = false;
          this.manualStatusSelect = 'RESOLVED';
        },
        error: () => {
          this.notificationStore.showToast({ type: 'error', message: 'Failed to resolve ticket. Please try again.' });
          this.submittingResolution.set(false);
        },
      });
  }

  isMobileDevice(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && !/Windows NT/i.test(navigator.userAgent));
  }

  takeEvidencePhoto(): void {
    if (this.stagedEvidencePreviews().length >= 5) {
      this.evidenceUploadError.set('You have reached the maximum limit of 5 resolution evidence images.');
      return;
    }

    if (this.isMobileDevice()) {
      if (this.evidenceCameraInput?.nativeElement) {
        this.evidenceCameraInput.nativeElement.click();
      }
    } else {
      this.openEvidenceCameraDialog();
    }
  }

  openEvidenceCameraDialog(): void {
    const dialogRef = this.dialog.open(CameraCaptureDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: {
        title: 'Take Repair Evidence Photo',
        subtitle: 'Capture completed repair work or equipment status as evidence'
      }
    });

    dialogRef.afterClosed().subscribe((result: CameraCaptureResult | null) => {
      if (!result) return;
      if (result.action === 'choose_file') {
        this.evidenceGalleryInput?.nativeElement.click();
      } else if (result.file) {
        this.addEvidenceFiles([result.file], true);
      }
    });
  }

  onEvidenceCameraCaptured(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.addEvidenceFiles(Array.from(input.files), true);
      input.value = '';
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addEvidenceFiles(Array.from(input.files), false);
      input.value = '';
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.addEvidenceFiles(Array.from(event.dataTransfer.files), false);
    }
  }

  addEvidenceFiles(files: File[], isCamera = false): void {
    this.evidenceUploadError.set(null);
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const current = this.stagedEvidencePreviews();

    if (current.length >= 5) {
      this.evidenceUploadError.set('You have reached the maximum limit of 5 resolution evidence images.');
      return;
    }

    const newItems: Array<{ file: File; name: string; sizeFormatted: string; previewUrl: string; isCameraCapture?: boolean }> = [];
    for (const file of files) {
      if (current.length + newItems.length >= 5) {
        this.evidenceUploadError.set('Maximum of 5 images can be attached. Extra files were ignored.');
        break;
      }

      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const isAllowedExt = allowedExts.includes(ext);
      const isAllowedMime = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';

      if (!isAllowedExt && !isAllowedMime) {
        this.evidenceUploadError.set(`"${file.name}" has an unsupported format. Only JPEG, PNG, and WebP are allowed.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.evidenceUploadError.set(`"${file.name}" exceeds the maximum allowed file size of 10 MB.`);
        continue;
      }

      newItems.push({
        file,
        name: file.name,
        sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        previewUrl: URL.createObjectURL(file),
        isCameraCapture: isCamera
      });
    }

    if (newItems.length > 0) {
      this.stagedEvidencePreviews.update(curr => [...curr, ...newItems].slice(0, 5));
    }
  }

  openStagedPreview(item: { previewUrl: string; name: string; sizeFormatted: string; isCameraCapture?: boolean }): void {
    this.dialog.open(ImageLightboxDialogComponent, {
      data: {
        url: item.previewUrl,
        fileName: item.name,
        fileSize: item.sizeFormatted,
        category: item.isCameraCapture ? 'Camera Capture' : 'Resolution Evidence'
      },
      width: '750px',
      maxWidth: '92vw',
      maxHeight: '92vh'
    });
  }

  retakeStagedEvidence(index: number): void {
    this.removeStagedEvidence(index);
    this.takeEvidencePhoto();
  }

  removeStagedEvidence(index: number): void {
    this.stagedEvidencePreviews.update(list => {
      const copy = [...list];
      const removed = copy.splice(index, 1);
      if (removed[0]?.previewUrl) {
        URL.revokeObjectURL(removed[0].previewUrl);
      }
      return copy;
    });
    this.evidenceUploadError.set(null);
  }

  cancelStagedFiles(): void {
    const list = this.stagedEvidencePreviews();
    for (const item of list) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    }
    this.stagedEvidencePreviews.set([]);
    this.evidenceUploadError.set(null);
  }

  uploadStagedEvidence(): void {
    const current = this.ticket();
    const previews = this.stagedEvidencePreviews();
    if (!current || previews.length === 0) return;

    this.uploadingEvidence.set(true);
    this.evidenceUploadError.set(null);
    const filesToUpload = previews.map(p => p.file);

    this.ticketService.uploadResolutionImages(current.id, filesToUpload).subscribe({
      next: () => {
        this.notificationStore.showToast({
          type: 'success',
          message: `${filesToUpload.length} resolution evidence image(s) uploaded successfully.`
        });
        for (const item of previews) {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        }
        this.stagedEvidencePreviews.set([]);
        this.uploadingEvidence.set(false);
        this.ticketStore.loadTicketById(current.id);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.Message || 'Failed to upload resolution evidence images.';
        this.evidenceUploadError.set(msg);
        this.notificationStore.showToast({ type: 'error', message: msg });
        this.uploadingEvidence.set(false);
      }
    });
  }

  openPreview(attachment: TicketAttachment): void {
    this.dialog.open(ImageLightboxDialogComponent, {
      data: {
        url: attachment.fileUrl,
        fileName: attachment.fileName
      },
      width: '750px',
      maxWidth: '92vw',
      maxHeight: '92vh'
    });
  }

  printWorkOrder(): void {
    window.print();
  }

  copyTicketLink(): void {
    navigator.clipboard?.writeText(window.location.href);
    this.notificationStore.showToast({ type: 'info', message: 'Ticket link copied to clipboard.' });
  }

  // Step helper methods
  getStepTitle(status: TicketStatus): string {
    switch (status) {
      case 'NEW':
        return 'Logged in System';
      case 'ASSIGNED':
        return 'Dispatched to Technician';
      case 'IN_PROGRESS':
        return 'Active Repair in Progress';
      case 'RESOLVED':
        return 'Work Completed (Resolved)';
      case 'CLOSED':
        return 'Archived & Closed';
      default:
        return status;
    }
  }

  isStepComplete(step: TicketStatus, currentStatus: TicketStatus): boolean {
    const rank: Record<string, number> = {
      NEW: 1,
      ASSIGNED: 2,
      IN_PROGRESS: 3,
      RESOLVED: 4,
      CLOSED: 5,
    };
    return rank[currentStatus] > rank[step];
  }

  getStepClass(step: TicketStatus, currentStatus: TicketStatus): string {
    if (step === currentStatus) {
      return 'border-2 border-[#0284C7] bg-[#F0F9FF] text-[#0284C7] shadow-xs font-bold';
    }
    if (this.isStepComplete(step, currentStatus)) {
      return 'border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] font-medium';
    }
    return 'border-[#E2E8F0] bg-[#F8FAFC] text-slate-400 font-normal';
  }

  getActivityNodeClass(act: any): string {
    switch (act.type) {
      case 'RESOLUTION':
        return 'bg-[#10B981]';
      case 'STATUS_CHANGE':
        return 'bg-[#0284C7]';
      case 'WORK_NOTE':
        return 'bg-[#D97706]';
      case 'EVIDENCE_UPLOAD':
        return 'bg-[#0D9488]';
      default:
        return 'bg-[#1E3A8A]';
    }
  }

  getActivityIcon(act: any): string {
    switch (act.type) {
      case 'RESOLUTION':
        return 'check_circle';
      case 'STATUS_CHANGE':
        return 'sync_alt';
      case 'WORK_NOTE':
        return 'description';
      case 'EVIDENCE_UPLOAD':
        return 'attach_file';
      case 'ASSIGNMENT':
        return 'badge';
      default:
        return 'info';
    }
  }

  getActivityTitle(act: any): string {
    switch (act.type) {
      case 'RESOLUTION':
        return 'Resolution Completed';
      case 'STATUS_CHANGE':
        return `Status Update: ${act.metadata?.newStatus || 'Changed'}`;
      case 'WORK_NOTE':
        return `Work Note: ${act.noteType?.replace('_', ' ') || 'General'}`;
      case 'EVIDENCE_UPLOAD':
        return 'Work Evidence Uploaded';
      case 'ASSIGNMENT':
        return 'Technician Dispatched';
      default:
        return 'Event Logged';
    }
  }

  formatFullDate(isoString: string): string {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatTimeAgo(isoString: string): string {
    if (!isoString) return 'recently';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}
