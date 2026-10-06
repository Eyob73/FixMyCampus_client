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

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadge, PriorityBadge, ConfirmModalComponent],
  template: `
    <div class="space-y-6">
      @if (loading() && !ticket()) {
        <div class="py-24 text-center">
          <span class="material-symbols-outlined text-4xl animate-spin text-[#1E3A8A]">progress_activity</span>
          <p class="text-sm font-medium text-slate-600 mt-3">Loading ticket details...</p>
        </div>
      } @else if (!ticket()) {
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center space-y-4">
          <span class="material-symbols-outlined text-5xl text-slate-300">error</span>
          <h2 class="text-lg font-bold text-slate-900">Ticket Not Found</h2>
          <p class="text-sm text-slate-600">The requested work order could not be located in your assigned queue.</p>
          <a
            routerLink="/technician/tickets"
            class="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-[#1D4ED8]"
          >
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            <span>Return to My Tickets</span>
          </a>
        </div>
      } @else {
        <!-- 1. Breadcrumbs & Meta Utility Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs font-medium text-[#64748B]">
            <a routerLink="/technician/dashboard" class="hover:text-[#1E3A8A] transition-colors">Dashboard</a>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <a routerLink="/technician/tickets" class="hover:text-[#1E3A8A] transition-colors">My Tickets</a>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span class="text-[#0F172A] font-bold">Ticket #{{ ticket()!.id }}</span>
          </nav>

          <div class="flex items-center gap-3">
            <span class="text-xs text-[#64748B] hidden md:inline">
              Last activity: {{ formatTimeAgo(ticket()!.updatedAt) }}
            </span>
            <span class="w-1 h-1 rounded-full bg-slate-300 hidden md:inline"></span>
            <button
              type="button"
              (click)="printWorkOrder()"
              class="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[16px]">print</span>
              <span>Print Work Order</span>
            </button>
            <button
              type="button"
              (click)="copyTicketLink()"
              class="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 cursor-pointer ml-1"
            >
              <span class="material-symbols-outlined text-[16px]">link</span>
              <span>Share</span>
            </button>
          </div>
        </div>

        <!-- 2. Ticket Header Banner -->
        <div
          class="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div class="space-y-1.5 min-w-0">
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">
                Ticket #{{ ticket()!.id }}: {{ ticket()!.title }}
              </h2>
              <app-status-badge [status]="ticket()!.status" />
              <app-priority-badge [priority]="ticket()!.priority" />
            </div>
            <p class="text-xs text-[#64748B] flex flex-wrap items-center gap-x-2 gap-y-1">
              <span class="flex items-center gap-1 text-[#334155] font-medium">
                <span class="material-symbols-outlined text-[15px] text-[#006398]">apartment</span>
                {{ ticket()!.building }} &bull; {{ ticket()!.room || 'General Area' }}
              </span>
              <span>&bull;</span>
              <span>Reported on {{ formatFullDate(ticket()!.createdAt) }}</span>
            </p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            @if (ticket()!.status === 'ASSIGNED') {
              <button
                type="button"
                (click)="confirmStartWork()"
                class="px-4 py-2 bg-[#1E3A8A] text-white hover:bg-[#1D4ED8] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span class="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>Start Work</span>
              </button>
            } @else if (ticket()!.status === 'IN_PROGRESS') {
              <button
                type="button"
                (click)="openResolutionModal()"
                class="px-4 py-2 bg-[#10B981] text-white hover:bg-[#059669] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span class="material-symbols-outlined text-[16px]">task_alt</span>
                <span>Mark as Resolved</span>
              </button>
            } @else if (ticket()!.status === 'RESOLVED') {
              <span class="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-lg text-xs font-semibold">
                <span class="material-symbols-outlined text-[16px]">verified</span>
                <span>Issue Resolved</span>
              </span>
            }
          </div>
        </div>

        <!-- 3. Linear Workflow Progress Strip (Matching Stitch & DESIGN.md) -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Technician Workflow Progression
            </span>
            <span class="text-xs font-semibold text-[#1E3A8A]">
              Current Stage: {{ getStepTitle(ticket()!.status) }}
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <!-- Step 1: New -->
            <div
              class="p-2.5 rounded-lg border flex flex-col items-center justify-center transition-all"
              [ngClass]="getStepClass('NEW', ticket()!.status)"
            >
              <div class="flex items-center gap-1 font-semibold">
                @if (isStepComplete('NEW', ticket()!.status)) {
                  <span class="material-symbols-outlined text-[15px] text-[#10B981]">check_circle</span>
                }
                <span>1. Logged</span>
              </div>
              <span class="text-[10px] opacity-75 mt-0.5">Submitted by Student/Staff</span>
            </div>

            <!-- Step 2: Assigned -->
            <div
              class="p-2.5 rounded-lg border flex flex-col items-center justify-center transition-all"
              [ngClass]="getStepClass('ASSIGNED', ticket()!.status)"
            >
              <div class="flex items-center gap-1 font-semibold">
                @if (isStepComplete('ASSIGNED', ticket()!.status)) {
                  <span class="material-symbols-outlined text-[15px] text-[#10B981]">check_circle</span>
                }
                <span>2. Assigned</span>
              </div>
              <span class="text-[10px] opacity-75 mt-0.5">Dispatched to You</span>
            </div>

            <!-- Step 3: In Progress -->
            <div
              class="p-2.5 rounded-lg border flex flex-col items-center justify-center transition-all"
              [ngClass]="getStepClass('IN_PROGRESS', ticket()!.status)"
            >
              <div class="flex items-center gap-1 font-semibold">
                @if (isStepComplete('IN_PROGRESS', ticket()!.status)) {
                  <span class="material-symbols-outlined text-[15px] text-[#10B981]">check_circle</span>
                }
                <span>3. In Progress</span>
              </div>
              <span class="text-[10px] opacity-75 mt-0.5">Physical Repair Underway</span>
            </div>

            <!-- Step 4: Resolved -->
            <div
              class="p-2.5 rounded-lg border flex flex-col items-center justify-center transition-all"
              [ngClass]="getStepClass('RESOLVED', ticket()!.status)"
            >
              <div class="flex items-center gap-1 font-semibold">
                @if (isStepComplete('RESOLVED', ticket()!.status)) {
                  <span class="material-symbols-outlined text-[15px] text-[#10B981]">check_circle</span>
                }
                <span>4. Resolved</span>
              </div>
              <span class="text-[10px] opacity-75 mt-0.5">Ready for Final Inspection</span>
            </div>
          </div>
        </div>

        <!-- 4. Two-Column Operational Layout (7 cols / 5 cols) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- LEFT COLUMN: Ticket Information, Reporter, Attachments & Evidence (7 Cols) -->
          <div class="lg:col-span-7 space-y-6">
            <!-- Card 1: Ticket Details -->
            <div class="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-5">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#1E3A8A]">description</span>
                  <h3 class="text-base font-bold text-[#0F172A]">Work Order Specifications</h3>
                </div>
                <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-[#334155]">
                  Category: {{ ticket()!.category }}
                </span>
              </div>

              <!-- Detail Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-[#64748B] block uppercase tracking-wider">
                    Facility Location
                  </label>
                  <div class="flex items-center gap-2 text-sm text-[#0F172A] font-medium">
                    <span class="material-symbols-outlined text-[18px] text-[#006398]">apartment</span>
                    <span>{{ ticket()!.building }} &bull; {{ ticket()!.room || 'General' }}</span>
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-semibold text-[#64748B] block uppercase tracking-wider">
                    Assigned Technician
                  </label>
                  <div class="flex items-center gap-2 text-sm text-[#0F172A] font-medium">
                    <span class="material-symbols-outlined text-[18px] text-[#1E3A8A]">engineering</span>
                    <span>{{ ticket()!.assignedTechnicianName || authService.currentUser()?.name }}</span>
                  </div>
                  <span class="text-xs text-[#64748B] block pl-6">
                    {{ ticket()!.assignedTechnicianSpecialty || authService.currentUser()?.department }}
                  </span>
                </div>

                <!-- Reporter Contact Row -->
                <div class="space-y-2 md:col-span-2 border-t border-slate-100 pt-3">
                  <label class="text-xs font-semibold text-[#64748B] block uppercase tracking-wider">
                    Reporter Contact Details
                  </label>
                  <div class="flex items-center justify-between flex-wrap gap-3 bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-[#E0E7FF] text-[#1E3A8A] flex items-center justify-center font-bold text-xs">
                        {{ ticket()!.reporterName?.charAt(0) || '?' }}
                      </div>
                      <div>
                        <p class="text-sm font-bold text-[#0F172A]">
                          {{ ticket()!.reporterName }}
                        </p>
                        <p class="text-xs text-[#64748B]">{{ ticket()!.reporterRole || 'Reporter' }}</p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <a
                        [href]="'mailto:' + ticket()!.reporterEmail"
                        class="px-2.5 py-1.5 bg-white border border-[#CBD5E1] text-[#1E3A8A] hover:bg-[#EFF6FF] rounded text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span class="material-symbols-outlined text-[14px]">mail</span>
                        <span>Email Reporter</span>
                      </a>
                      @if (ticket()!.reporterPhone) {
                        <a
                          [href]="'tel:' + ticket()!.reporterPhone"
                          class="px-2.5 py-1.5 bg-white border border-[#CBD5E1] text-[#334155] hover:bg-slate-50 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span class="material-symbols-outlined text-[14px]">call</span>
                          <span>Call</span>
                        </a>
                      }
                    </div>
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-semibold text-[#64748B] block uppercase tracking-wider">Created Date</label>
                  <p class="text-xs text-[#0F172A] font-medium">{{ formatFullDate(ticket()!.createdAt) }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-[#64748B] block uppercase tracking-wider">Assigned Date</label>
                  <p class="text-xs text-[#0F172A] font-medium">{{ formatFullDate(ticket()!.updatedAt || '') }}</p>
                </div>
              </div>

              <!-- Issue Description Box -->
              <div class="space-y-2 border-t border-slate-100 pt-4">
                <label class="text-xs font-semibold text-[#64748B] block uppercase tracking-wider">
                  Original Issue Description
                </label>
                <div class="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] leading-relaxed">
                  "{{ ticket()!.description }}"
                </div>
              </div>

              <!-- Existing Reporter Attachments -->
              @if (reporterAttachments.length > 0) {
                <div class="space-y-2 border-t border-slate-100 pt-4">
                  <label class="text-xs font-semibold text-[#64748B] block uppercase tracking-wider">
                    Reporter Attachments
                  </label>
                  <div class="flex flex-wrap gap-2">
                    @for (att of reporterAttachments; track att.id) {
                      <div class="flex items-center gap-2 p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs">
                        <span class="material-symbols-outlined text-base text-[#1E3A8A]">image</span>
                        <div class="flex flex-col">
                          <span class="font-medium text-[#0F172A]">{{ att.fileName }}</span>
                          <span class="text-[10px] text-[#64748B]">{{ att.fileSize }}</span>
                        </div>
                        <a
                          [href]="att.fileUrl"
                          target="_blank"
                          class="ml-2 text-xs text-[#1E3A8A] font-semibold hover:underline"
                        >
                          View
                        </a>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Card 2: Resolution Summary (Shown when ticket is Resolved or Closed) -->
            @if (ticket()!.resolution; as res) {
              <div class="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-6 shadow-xs space-y-4">
                <div class="flex items-center justify-between border-b border-[#A7F3D0] pb-3">
                  <div class="flex items-center gap-2 text-[#065F46]">
                    <span class="material-symbols-outlined text-xl">verified</span>
                    <h3 class="text-base font-bold">Work Order Resolution Report</h3>
                  </div>
                  <span class="text-xs font-semibold text-[#065F46] bg-white/70 px-2 py-0.5 rounded">
                    Resolved: {{ formatFullDate(res.resolvedAt) }}
                  </span>
                </div>

                <div class="space-y-3 text-xs text-[#065F46]">
                  <div>
                    <strong class="block text-[11px] uppercase tracking-wider text-[#047857]">Resolved By:</strong>
                    <span class="text-sm font-semibold text-[#0F172A]">{{ res.resolvedBy }}</span>
                  </div>
                  <div>
                    <strong class="block text-[11px] uppercase tracking-wider text-[#047857]">Resolution Summary:</strong>
                    <p class="text-sm text-[#0F172A] mt-0.5 bg-white p-3 rounded-lg border border-[#A7F3D0] leading-relaxed">
                      {{ res.resolutionDescription }}
                    </p>
                  </div>
                  <div>
                    <strong class="block text-[11px] uppercase tracking-wider text-[#047857]">Work Performed:</strong>
                    <p class="text-sm text-[#0F172A] mt-0.5 bg-white p-3 rounded-lg border border-[#A7F3D0] leading-relaxed">
                      {{ res.workPerformed }}
                    </p>
                  </div>
                  @if (res.materialsUsed) {
                    <div>
                      <strong class="block text-[11px] uppercase tracking-wider text-[#047857]">Materials / Equipment Used:</strong>
                      <span class="text-sm text-[#0F172A] font-medium">{{ res.materialsUsed }}</span>
                    </div>
                  }
                  @if (res.additionalNotes) {
                    <div>
                      <strong class="block text-[11px] uppercase tracking-wider text-[#047857]">Additional Notes:</strong>
                      <p class="text-xs text-[#334155] mt-0.5">{{ res.additionalNotes }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Card 3: Technician Work Evidence & File Upload Zone -->
            <div class="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#1E3A8A]">photo_camera</span>
                  <h3 class="text-base font-bold text-[#0F172A]">Supporting Evidence & Repair Photos</h3>
                </div>
                <span class="text-xs text-[#64748B]">Before/After & Documents</span>
              </div>

              <!-- Upload Drag & Drop Area -->
              <div
                class="border-2 border-dashed border-[#CBD5E1] hover:border-[#1E3A8A] rounded-xl p-5 text-center transition-colors bg-[#F8FAFC]"
              >
                <input
                  type="file"
                  id="evidenceFileInput"
                  (change)="onFileSelected($event)"
                  accept="image/*,.pdf,.doc,.docx"
                  class="hidden"
                />
                <label for="evidenceFileInput" class="cursor-pointer block space-y-2">
                  <span class="material-symbols-outlined text-3xl text-[#1E3A8A]">cloud_upload</span>
                  <div class="text-xs text-[#0F172A]">
                    <span class="font-semibold text-[#1E3A8A] hover:underline">Choose evidence file</span>
                    <span> or drag &amp; drop photos</span>
                  </div>
                  <p class="text-[11px] text-[#64748B]">Supports JPEG, PNG, PDF up to 10MB</p>
                </label>
              </div>

              <!-- Staged File Preview (Before Submission) -->
              @if (stagedFile) {
                <div class="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3 flex items-center justify-between gap-3 text-xs">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="material-symbols-outlined text-lg text-[#1E3A8A]">attach_file</span>
                    <div class="truncate">
                      <p class="font-semibold text-[#1E3A8A] truncate">{{ stagedFile.name }}</p>
                      <p class="text-[11px] text-[#64748B]">{{ stagedFileSize }}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      (click)="cancelStagedFile()"
                      class="px-2 py-1 text-xs text-[#DC2626] hover:bg-white rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      (click)="uploadStagedEvidence()"
                      [disabled]="uploadingEvidence()"
                      class="px-3 py-1 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      @if (uploadingEvidence()) {
                        <span class="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                      }
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              }

              <!-- Uploaded Evidence Gallery -->
              @if (evidenceAttachments.length > 0) {
                <div class="space-y-2 pt-2">
                  <h4 class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Uploaded Evidence Files</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    @for (att of evidenceAttachments; track att.id) {
                      <div class="border border-[#E2E8F0] rounded-lg p-3 bg-white flex items-center justify-between gap-2 shadow-xs">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <span class="material-symbols-outlined text-xl text-[#10B981]">image</span>
                          <div class="truncate">
                            <p class="text-xs font-semibold text-[#0F172A] truncate">{{ att.fileName }}</p>
                            <p class="text-[10px] text-[#64748B]">{{ att.fileSize }} bytes &bull; On {{ att.uploadedAt | date:'short' }}</p>
                          </div>
                        </div>
                        <a
                          [href]="att.fileUrl"
                          target="_blank"
                          class="px-2 py-1 text-xs text-[#1E3A8A] font-semibold hover:bg-slate-100 rounded"
                        >
                          View
                        </a>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- RIGHT COLUMN: Workflow Action Controls & Status Timeline (5 Cols) -->
          <div class="lg:col-span-5 space-y-6">
            <!-- Card: Technician Workflow Action Controls -->
            <div class="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#1E3A8A]">tune</span>
                  <h3 class="text-base font-bold text-[#0F172A]">Status Management</h3>
                </div>
                <app-status-badge [status]="ticket()!.status" />
              </div>

              <!-- Permitted Status Actions Matrix -->
              <div class="space-y-3">
                @if (ticket()!.status === 'ASSIGNED') {
                  <div class="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg text-xs text-[#92400E] space-y-2">
                    <p class="font-medium">
                      Ticket is currently <strong>Assigned</strong>. Click below to transition to <strong>In Progress</strong> when commencing inspection or physical work.
                    </p>
                    <button
                      type="button"
                      (click)="confirmStartWork()"
                      [disabled]="actionLoading()"
                      class="w-full py-2.5 px-3 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                    >
                      @if (actionLoading()) {
                        <span class="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                      } @else {
                        <span class="material-symbols-outlined text-sm">play_arrow</span>
                      }
                      <span>Start Work (Move to In Progress)</span>
                    </button>
                  </div>
                } @else if (ticket()!.status === 'IN_PROGRESS') {
                  <div class="p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg text-xs text-[#0369A1] space-y-2">
                    <p class="font-medium">
                      Ticket is <strong>In Progress</strong>. When all diagnostics, replacements, and testing are done, complete the resolution report.
                    </p>
                    <button
                      type="button"
                      (click)="openResolutionModal()"
                      class="w-full py-2.5 px-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                      <span>Mark as Resolved</span>
                    </button>
                  </div>
                } @else if (ticket()!.status === 'RESOLVED') {
                  <div class="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-xs text-[#065F46] flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">check_circle</span>
                    <span>Ticket marked as resolved. Central administrator will verify and close.</span>
                  </div>
                }
              </div>

              <!-- Manual Status Override (Restricted to Authorized Transitions) -->
              <div class="space-y-1.5 pt-2 border-t border-slate-100">
                <label class="text-xs font-semibold text-[#64748B] block uppercase tracking-wider">
                  Update Status Manually
                </label>
                <div class="flex items-center gap-2">
                  <select
                    [(ngModel)]="manualStatusSelect"
                    class="flex-1 h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs font-medium text-[#334155] focus:outline-none focus:border-[#1E3A8A]"
                  >
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                  <button
                    type="button"
                    (click)="applyManualStatus()"
                    [disabled]="manualStatusSelect === ticket()!.status || actionLoading()"
                    class="px-3 h-[36px] bg-white border border-[#CBD5E1] text-[#1E3A8A] hover:bg-[#EFF6FF] rounded text-xs font-semibold transition-colors disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            <!-- Card: Add Work Note / Comment -->
            <div class="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#1E3A8A]">edit_note</span>
                  <h3 class="text-base font-bold text-[#0F172A]">Log Work Note</h3>
                </div>
                <span class="text-xs text-[#64748B]">Audit Trail Log</span>
              </div>

              <div class="space-y-3">
                <!-- Note Type Selector -->
                <div>
                  <label class="text-xs font-semibold text-[#64748B] block mb-1">Note Category</label>
                  <select
                    [(ngModel)]="newNoteType"
                    class="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs text-[#334155] focus:outline-none focus:border-[#1E3A8A]"
                  >
                    <option value="DIAGNOSIS">Diagnosis</option>
                    <option value="WORK_PERFORMED">Work Performed</option>
                    <option value="MATERIALS_REQUIRED">Materials / Parts Required</option>
                    <option value="DELAY_REASON">Reason for Delay</option>
                    <option value="GENERAL">General Maintenance Update</option>
                  </select>
                </div>

                <!-- Note Text Area -->
                <div>
                  <label class="text-xs font-semibold text-[#64748B] block mb-1">Details &amp; Observations</label>
                  <textarea
                    [(ngModel)]="newNoteContent"
                    rows="3"
                    placeholder="Enter diagnostic notes, parts used, or inspection updates..."
                    class="w-full p-2.5 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                  ></textarea>
                </div>

                <div class="flex justify-end">
                  <button
                    type="button"
                    (click)="submitWorkNote()"
                    [disabled]="!newNoteContent.trim() || submittingNote()"
                    class="px-4 py-2 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    @if (submittingNote()) {
                      <span class="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                    }
                    <span>Post Note to Timeline</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Card: Status History & Audit Trail (Vertical Timeline) -->
            <div class="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#1E3A8A]">timeline</span>
                  <h3 class="text-base font-bold text-[#0F172A]">Activity Timeline</h3>
                </div>
                <span class="text-xs font-mono text-[#64748B]">{{ ticket()!.activityLog?.length || 0 }} events</span>
              </div>

              <!-- Vertical Timeline Component (Matching Stitch Admin Details) -->
              <div class="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#CBD5E1]">
                @for (activity of sortedActivities; track activity.id) {
                  <div class="relative flex items-start gap-3">
                    <!-- Timeline Node Icon -->
                    <div
                      class="absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                      [ngClass]="getActivityNodeClass(activity)"
                    >
                      <span class="material-symbols-outlined text-[12px]">{{ getActivityIcon(activity) }}</span>
                    </div>

                    <!-- Timeline Content Box -->
                    <div class="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 space-y-1 text-xs">
                      <div class="flex items-center justify-between flex-wrap gap-1">
                        <span class="font-bold text-[#0F172A]">{{ getActivityTitle(activity) }}</span>
                        <span class="text-[10px] text-[#64748B] font-mono">{{ formatTimeAgo(activity.timestamp) }}</span>
                      </div>
                      <p class="text-[#334155] leading-relaxed">{{ activity.comment || activity.action }}</p>
                      <div class="pt-1 text-[10px] text-[#64748B] flex items-center gap-1 border-t border-slate-100 mt-1">
                        <span class="material-symbols-outlined text-[12px]">person</span>
                        <span>
                          <strong>{{ activity.actorName }}</strong> ({{ activity.actorRole }})
                        </span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Resolution Modal / Interface -->
        @if (showResolutionModal) {
          <div
            class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
            (click)="closeResolutionModal()"
          >
            <div
              class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4"
              (click)="$event.stopPropagation()"
            >
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2 text-[#065F46]">
                  <span class="material-symbols-outlined text-2xl">verified</span>
                  <h3 class="text-base font-bold text-slate-900">Close Out &amp; Resolve Work Order</h3>
                </div>
                <button (click)="closeResolutionModal()" class="text-slate-400 hover:text-slate-600">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>

              <div class="space-y-3.5 text-xs text-slate-700">
                <p class="text-slate-500">
                  Please document the resolution before marking Ticket #{{ ticket()!.id }} as completed. Required fields are marked with *.
                </p>

                <!-- Resolution Description (Required) -->
                <div>
                  <label class="font-semibold text-slate-900 block mb-1">
                    Resolution Summary *
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="resolutionForm.description"
                    placeholder="e.g. Diagnosed ballast short circuit and installed new power module."
                    class="w-full h-[36px] px-3 bg-white border rounded text-xs focus:outline-none focus:border-[#1E3A8A]"
                    [ngClass]="{ 'border-red-400': resolutionError && !resolutionForm.description }"
                  />
                </div>

                <!-- Work Performed (Required) -->
                <div>
                  <label class="font-semibold text-slate-900 block mb-1">
                    Work Performed *
                  </label>
                  <textarea
                    [(ngModel)]="resolutionForm.workPerformed"
                    rows="3"
                    placeholder="Detail the steps taken, adjustments made, and test procedures executed..."
                    class="w-full p-2.5 bg-white border rounded text-xs focus:outline-none focus:border-[#1E3A8A]"
                    [ngClass]="{ 'border-red-400': resolutionError && !resolutionForm.workPerformed }"
                  ></textarea>
                </div>

                <!-- Materials Used (Optional) -->
                <div>
                  <label class="font-semibold text-slate-900 block mb-1">
                    Materials / Parts Replaced (Optional)
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="resolutionForm.materialsUsed"
                    placeholder="e.g. 1x HDMI Balun #EX-300, 2x Wire Nuts, 10ft Cat6 Cable"
                    class="w-full h-[36px] px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <!-- Additional Notes (Optional) -->
                <div>
                  <label class="font-semibold text-slate-900 block mb-1">
                    Additional Inspection Notes (Optional)
                  </label>
                  <textarea
                    [(ngModel)]="resolutionForm.additionalNotes"
                    rows="2"
                    placeholder="Follow-up recommendations or future preventative maintenance notice..."
                    class="w-full p-2 bg-white border border-[#CBD5E1] rounded text-xs focus:outline-none focus:border-[#1E3A8A]"
                  ></textarea>
                </div>

                @if (resolutionError) {
                  <div class="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm">warning</span>
                    <span>Please fill in both the Resolution Summary and Work Performed.</span>
                  </div>
                }
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  (click)="closeResolutionModal()"
                  class="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="submitResolution()"
                  [disabled]="submittingResolution()"
                  class="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  @if (submittingResolution()) {
                    <span class="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                  }
                  <span>Submit Resolution &amp; Complete Ticket</span>
                </button>
              </div>
            </div>
          </div>
        }

        <!-- 6. Confirmation Modal for Starting Work -->
        <app-confirm-modal
          [isOpen]="confirmStartModalOpen"
          title="Start Work on Ticket"
          message="Are you ready to mark this ticket as IN PROGRESS? This documents that you are actively on site and working on resolution."
          confirmText="Yes, Start Work"
          variant="primary"
          [loading]="actionLoading()"
          (confirm)="executeStartWork()"
          (cancel)="confirmStartModalOpen = false"
        />
      }
    </div>
  `,
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
