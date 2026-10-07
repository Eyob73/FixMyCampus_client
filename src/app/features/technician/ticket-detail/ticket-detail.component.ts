import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadge, PriorityBadge, ConfirmModalComponent, PageContainerComponent],
  templateUrl: './ticket-detail.component.html',
})
export class TicketDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly ticketService = inject(TicketService);
  readonly ticketStore = inject(TicketStore);
  readonly authService = inject(AuthService);
  private readonly notificationStore = inject(NotificationStore);

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

  // Staged evidence file
  stagedFile: File | null = null;
  stagedFileSize = '';

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
    return (this.ticket()?.attachments || []);
  }

  get evidenceAttachments(): TicketAttachment[] {
    return [];
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.stagedFile = file;
      this.stagedFileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  cancelStagedFile(): void {
    this.stagedFile = null;
    this.stagedFileSize = '';
  }

  uploadStagedEvidence(): void {
    const current = this.ticket();
    if (!current || !this.stagedFile) return;

    this.uploadingEvidence.set(true);
    const mockUrl =
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';

    this.ticketService
      .uploadAttachment(current.id, {
        fileName: this.stagedFile.name,
        fileUrl: mockUrl,
        fileSize: this.stagedFileSize,
        fileType: this.stagedFile.type || 'image/jpeg',
        isEvidence: true,
      })
      .subscribe({
        next: () => {
          this.notificationStore.showToast({ type: 'success', message: `Evidence file "${this.stagedFile?.name}" uploaded.` });
          this.ticketStore.loadTicketById(current.id);
          this.stagedFile = null;
          this.stagedFileSize = '';
          this.uploadingEvidence.set(false);
        },
        error: () => {
          this.notificationStore.showToast({ type: 'error', message: 'Failed to upload evidence file.' });
          this.uploadingEvidence.set(false);
        },
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
