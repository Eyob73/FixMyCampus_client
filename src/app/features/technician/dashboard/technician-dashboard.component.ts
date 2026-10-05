import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import {
  TechnicianDashboardStats,
  Ticket,
  TicketStatus,
} from '../../../models/ticket.model';
import { StatusBadge } from '../../../components/status-badge/status-badge';
import { PriorityBadge } from '../../../components/priority-badge/priority-badge.component';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadge, PriorityBadge],
  template: `
    <div class="space-y-6">
      <!-- 1. Welcome Header Banner with CTA -->
      <section
        class="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div class="space-y-1">
          <div class="flex items-center space-x-2.5">
            <h1 class="text-2xl font-bold text-[#0F172A] tracking-tight">
              Welcome back, {{ authService.currentUser()?.name.split(' ')[0] }}
            </h1>
            <span
              class="bg-[#EFF6FF] text-[#1E3A8A] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#DBEAFE]"
            >
              Assigned Workdesk
            </span>
          </div>
          <p class="text-sm text-[#64748B]">
            Manage assigned physical plant work orders, execute diagnostics, update statuses, and submit completion reports.
          </p>
        </div>

        <div class="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            (click)="refreshData()"
            [disabled]="loading()"
            class="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            title="Refresh dashboard stats"
          >
            <span class="material-symbols-outlined text-[16px]" [ngClass]="{ 'animate-spin': loading() }">
              refresh
            </span>
            <span>Refresh</span>
          </button>

          <a
            routerLink="/technician/tickets"
            [queryParams]="{ status: 'IN_PROGRESS' }"
            class="inline-flex items-center space-x-2 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white h-[38px] px-4 rounded-lg text-sm font-semibold transition-all shadow-xs active:scale-[0.98]"
          >
            <span class="material-symbols-outlined text-[18px]">build</span>
            <span>Active Work Queue</span>
          </a>
        </div>
      </section>

      <!-- 2. Workload Metric Stat Cards Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <!-- Card 1: Total Assigned -->
        <div
          class="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs hover:border-[#CBD5E1] transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Assigned</span>
            <div class="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1E3A8A] flex items-center justify-center border border-[#DBEAFE]">
              <span class="material-symbols-outlined text-[18px]">assignment</span>
            </div>
          </div>
          <div class="mt-3 flex items-baseline space-x-2">
            <span class="text-2xl font-bold font-mono text-[#0F172A]">{{ stats()?.totalAssigned ?? 0 }}</span>
            <span class="text-[11px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] px-1.5 py-0.5 rounded">All time</span>
          </div>
          <p class="mt-1 text-[11px] text-[#64748B]">Assigned tickets</p>
        </div>

        <!-- Card 2: New / Assigned Queue -->
        <div
          class="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs hover:border-[#CBD5E1] transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Assigned / Queued</span>
            <div class="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center border border-[#FDE68A]">
              <span class="material-symbols-outlined text-[18px]">pending_actions</span>
            </div>
          </div>
          <div class="mt-3 flex items-baseline space-x-2">
            <span class="text-2xl font-bold font-mono text-[#0F172A]">{{ stats()?.newAssigned ?? 0 }}</span>
            <span class="text-[11px] font-semibold text-[#D97706] bg-[#FFFBEB] px-1.5 py-0.5 rounded">Pending Start</span>
          </div>
          <p class="mt-1 text-[11px] text-[#64748B]">Requires technician arrival</p>
        </div>

        <!-- Card 3: In Progress -->
        <div
          class="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs hover:border-[#CBD5E1] transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">In Progress</span>
            <div class="w-8 h-8 rounded-lg bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center border border-[#BAE6FD]">
              <span class="material-symbols-outlined text-[18px]">build</span>
            </div>
          </div>
          <div class="mt-3 flex items-baseline space-x-2">
            <span class="text-2xl font-bold font-mono text-[#0F172A]">{{ stats()?.inProgress ?? 0 }}</span>
            <span class="text-[11px] font-semibold text-[#0284C7] bg-[#F0F9FF] px-1.5 py-0.5 rounded">Under Repair</span>
          </div>
          <p class="mt-1 text-[11px] text-[#64748B]">Active diagnostics & repair</p>
        </div>

        <!-- Card 4: Resolved -->
        <div
          class="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs hover:border-[#CBD5E1] transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Resolved</span>
            <div class="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center border border-[#A7F3D0]">
              <span class="material-symbols-outlined text-[18px]">task_alt</span>
            </div>
          </div>
          <div class="mt-3 flex items-baseline space-x-2">
            <span class="text-2xl font-bold font-mono text-[#0F172A]">{{ stats()?.resolved ?? 0 }}</span>
            <span class="text-[11px] font-semibold text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.5 rounded">Fixed</span>
          </div>
          <p class="mt-1 text-[11px] text-[#64748B]">Work completed</p>
        </div>

        <!-- Card 5: Closed -->
        <div
          class="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs hover:border-[#CBD5E1] transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Closed</span>
            <div class="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#475569] flex items-center justify-center border border-[#CBD5E1]">
              <span class="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div class="mt-3 flex items-baseline space-x-2">
            <span class="text-2xl font-bold font-mono text-[#0F172A]">{{ stats()?.closed ?? 0 }}</span>
            <span class="text-[11px] font-semibold text-[#475569] bg-[#F1F5F9] px-1.5 py-0.5 rounded">Archived</span>
          </div>
          <p class="mt-1 text-[11px] text-[#64748B]">Audited by administrator</p>
        </div>

        <!-- Card 6: High Priority -->
        <div
          class="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs hover:border-[#CBD5E1] transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">High / Critical</span>
            <div class="w-8 h-8 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center border border-[#FECACA]">
              <span class="material-symbols-outlined text-[18px]">priority_high</span>
            </div>
          </div>
          <div class="mt-3 flex items-baseline space-x-2">
            <span class="text-2xl font-bold font-mono text-[#DC2626]">{{ stats()?.highPriority ?? 0 }}</span>
            <span class="text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded">Urgent Attention</span>
          </div>
          <p class="mt-1 text-[11px] text-[#64748B]">Escalated SLA issues</p>
        </div>
      </section>

      <!-- 3. Workload Analytics & Distribution Visuals -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Workload Pipeline Progress -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-base font-bold text-[#0F172A]">Workload Lifecycle Distribution</h3>
              <p class="text-xs text-[#64748B]">Proportion of active vs completed maintenance tickets</p>
            </div>
            <span class="text-xs font-mono font-medium text-[#1E3A8A]">
              {{ completionRate }}% Completion Rate
            </span>
          </div>

          <!-- Multi-segment Progress Bar -->
          <div class="space-y-2">
            <div class="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                class="bg-[#D97706] transition-all duration-300"
                [style.width.%]="assignedPercent"
                title="Assigned: {{ stats()?.newAssigned }}"
              ></div>
              <div
                class="bg-[#0284C7] transition-all duration-300"
                [style.width.%]="inProgressPercent"
                title="In Progress: {{ stats()?.inProgress }}"
              ></div>
              <div
                class="bg-[#10B981] transition-all duration-300"
                [style.width.%]="resolvedPercent"
                title="Resolved: {{ stats()?.resolved }}"
              ></div>
              <div
                class="bg-[#475569] transition-all duration-300"
                [style.width.%]="closedPercent"
                title="Closed: {{ stats()?.closed }}"
              ></div>
            </div>

            <!-- Legend -->
            <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B] pt-1">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-[#D97706]"></span>
                <span>Assigned ({{ stats()?.newAssigned ?? 0 }})</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-[#0284C7]"></span>
                <span>In Progress ({{ stats()?.inProgress ?? 0 }})</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-[#10B981]"></span>
                <span>Resolved ({{ stats()?.resolved ?? 0 }})</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-[#475569]"></span>
                <span>Closed ({{ stats()?.closed ?? 0 }})</span>
              </div>
            </div>
          </div>

          <!-- Operational Notes Callout -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div class="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
              <span class="text-xs text-[#64748B] block">Average Turnaround Time</span>
              <span class="text-lg font-bold text-[#0F172A] font-mono">4.2 hours</span>
              <p class="text-[11px] text-[#10B981] font-medium mt-0.5">Within 8hr campus SLA standard</p>
            </div>
            <div class="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
              <span class="text-xs text-[#64748B] block">First-Time Resolution Rate</span>
              <span class="text-lg font-bold text-[#0F172A] font-mono">94%</span>
              <p class="text-[11px] text-[#10B981] font-medium mt-0.5">+2% above campus target</p>
            </div>
          </div>
        </div>

        <!-- Right: Priority Breakdown & Quick Actions -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-base font-bold text-[#0F172A]">Urgency Triage</h3>
            <p class="text-xs text-[#64748B]">Assigned tickets by priority severity</p>
          </div>

          <div class="space-y-2.5">
            <!-- Critical -->
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-[#DC2626] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#DC2626]"></span>
                Critical
              </span>
              <span class="font-bold font-mono text-[#0F172A]">{{ stats()?.priorityCounts?.critical ?? 0 }}</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                class="bg-[#DC2626] h-full"
                [style.width.%]="calcPriorityPercent(stats()?.priorityCounts?.critical)"
              ></div>
            </div>

            <!-- High -->
            <div class="flex items-center justify-between text-xs pt-1">
              <span class="font-medium text-[#C2410C] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#EA580C]"></span>
                High
              </span>
              <span class="font-bold font-mono text-[#0F172A]">{{ stats()?.priorityCounts?.high ?? 0 }}</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                class="bg-[#EA580C] h-full"
                [style.width.%]="calcPriorityPercent(stats()?.priorityCounts?.high)"
              ></div>
            </div>

            <!-- Medium -->
            <div class="flex items-center justify-between text-xs pt-1">
              <span class="font-medium text-[#0369A1] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                Medium
              </span>
              <span class="font-bold font-mono text-[#0F172A]">{{ stats()?.priorityCounts?.medium ?? 0 }}</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                class="bg-[#0284C7] h-full"
                [style.width.%]="calcPriorityPercent(stats()?.priorityCounts?.medium)"
              ></div>
            </div>

            <!-- Low -->
            <div class="flex items-center justify-between text-xs pt-1">
              <span class="font-medium text-[#475569] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#64748B]"></span>
                Low
              </span>
              <span class="font-bold font-mono text-[#0F172A]">{{ stats()?.priorityCounts?.low ?? 0 }}</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                class="bg-[#64748B] h-full"
                [style.width.%]="calcPriorityPercent(stats()?.priorityCounts?.low)"
              ></div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <a
              routerLink="/technician/tickets"
              [queryParams]="{ priority: 'CRITICAL' }"
              class="w-full py-2 px-3 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded-lg text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <span class="material-symbols-outlined text-[16px]">warning</span>
              <span>Filter Critical Escalations</span>
            </a>
          </div>
        </div>
      </section>

      <!-- 4. Recent Assigned Tickets Table Section -->
      <section
        class="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden"
      >
        <!-- Table Control Toolbar -->
        <div class="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-[#0F172A]">Recent Assigned Work Orders</h2>
            <p class="text-xs text-[#64748B]">Latest campus facility tickets dispatched to your workload</p>
          </div>

          <div class="flex items-center gap-2">
            <a
              routerLink="/technician/tickets"
              class="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] hover:text-[#1D4ED8] p-2 hover:bg-[#EFF6FF] rounded-lg transition-colors"
            >
              <span>View All Tickets</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>

        <!-- Table List -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th class="py-3 px-4 w-12 text-center">Pri</th>
                <th class="py-3 px-4">Ticket ID & Title</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Location</th>
                <th class="py-3 px-4">Reporter</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F5F9] text-sm">
              @if (loading() && recentTickets().length === 0) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-500">
                    <span class="material-symbols-outlined text-2xl animate-spin text-[#1E3A8A]">progress_activity</span>
                    <p class="text-xs mt-2 font-medium">Loading assigned workload...</p>
                  </td>
                </tr>
              } @else if (recentTickets().length === 0) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-500">
                    <span class="material-symbols-outlined text-3xl text-slate-400">task</span>
                    <p class="text-sm font-semibold text-slate-800 mt-2">No assigned tickets found</p>
                    <p class="text-xs text-slate-500">You currently have no pending tickets assigned to your queue.</p>
                  </td>
                </tr>
              } @else {
                @for (ticket of recentTickets(); track ticket.id) {
                  <tr class="hover:bg-[#F8FAFC] transition-colors group">
                    <!-- Priority Bar / Indicator -->
                    <td class="py-3 px-4 text-center">
                      <app-priority-badge [priority]="ticket.priority" />
                    </td>

                    <!-- Ticket ID & Title Stack -->
                    <td class="py-3 px-4">
                      <div class="flex flex-col">
                        <a
                          [routerLink]="['/technician/tickets', ticket.id]"
                          class="font-semibold text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors hover:underline text-sm leading-snug"
                        >
                          {{ ticket.id }}: {{ ticket.title }}
                        </a>
                        <span class="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                          <span class="material-symbols-outlined text-[13px]">schedule</span>
                          Updated {{ formatTimeAgo(ticket.updatedAt) }}
                        </span>
                      </div>
                    </td>

                    <!-- Category -->
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center gap-1 text-xs text-[#334155] bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {{ ticket.category }}
                      </span>
                    </td>

                    <!-- Location -->
                    <td class="py-3 px-4">
                      <div class="flex flex-col text-xs text-[#334155]">
                        <span class="font-medium">{{ ticket.building }}</span>
                        <span class="text-[#64748B]">{{ ticket.room || 'General Area' }}</span>
                      </div>
                    </td>

                    <!-- Reporter -->
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-[#E0E7FF] text-[#4338CA] flex items-center justify-center text-[10px] font-bold">
                          {{ ticket.reporterName?.charAt(0) || 'U' }}
                        </div>
                        <span class="text-xs text-[#334155] font-medium">{{ ticket.reporterName || 'Unknown' }}</span>
                      </div>
                    </td>

                    <!-- Status Badge -->
                    <td class="py-3 px-4">
                      <app-status-badge [status]="ticket.status" />
                    </td>

                    <!-- Direct Action Buttons -->
                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        @if (ticket.status === 'ASSIGNED') {
                          <button
                            type="button"
                            (click)="quickStartWork(ticket)"
                            class="px-2.5 py-1 bg-[#1E3A8A] text-white hover:bg-[#1D4ED8] rounded text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Start Work on this ticket"
                          >
                            <span class="material-symbols-outlined text-[14px]">play_arrow</span>
                            <span>Start</span>
                          </button>
                        } @else if (ticket.status === 'IN_PROGRESS') {
                          <a
                            [routerLink]="['/technician/tickets', ticket.id]"
                            class="px-2.5 py-1 bg-[#10B981] text-white hover:bg-[#059669] rounded text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Open Resolution Screen"
                          >
                            <span class="material-symbols-outlined text-[14px]">check</span>
                            <span>Resolve</span>
                          </a>
                        }

                        <a
                          [routerLink]="['/technician/tickets', ticket.id]"
                          class="p-1.5 text-slate-500 hover:text-[#1E3A8A] hover:bg-slate-100 rounded transition-colors"
                          title="View Full Details"
                        >
                          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
})
export class TechnicianDashboardComponent implements OnInit {
  readonly ticketService = inject(TicketService);
  readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  readonly stats = this.ticketService.currentStats;
  readonly recentTickets = signal<Ticket[]>([]);
  readonly loading = signal<boolean>(false);

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.loading.set(true);
    this.ticketService.getDashboardStats().subscribe({
      next: () => {},
      error: (err) => {
        this.notification.error('Failed to load dashboard statistics from backend API.');
        this.loading.set(false);
      },
    });

    this.ticketService.getTechnicianTickets({ pageSize: 6, sortBy: 'updatedAt', sortDirection: 'desc' }).subscribe({
      next: (res) => {
        this.recentTickets.set(res.tickets);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  quickStartWork(ticket: Ticket): void {
    this.ticketService.updateStatus(ticket.id, 'IN_PROGRESS', 'Technician started work via quick action.').subscribe({
      next: () => {
        this.notification.success(`Ticket #${ticket.id} status updated to IN PROGRESS.`);
        this.refreshData();
      },
      error: () => {
        this.notification.error(`Failed to update ticket #${ticket.id}.`);
      },
    });
  }

  get completionRate(): number {
    const s = this.stats();
    if (!s || s.totalAssigned === 0) return 0;
    const completed = s.resolved + s.closed;
    return Math.round((completed / s.totalAssigned) * 100);
  }

  get assignedPercent(): number {
    const s = this.stats();
    if (!s || s.totalAssigned === 0) return 0;
    return (s.newAssigned / s.totalAssigned) * 100;
  }

  get inProgressPercent(): number {
    const s = this.stats();
    if (!s || s.totalAssigned === 0) return 0;
    return (s.inProgress / s.totalAssigned) * 100;
  }

  get resolvedPercent(): number {
    const s = this.stats();
    if (!s || s.totalAssigned === 0) return 0;
    return (s.resolved / s.totalAssigned) * 100;
  }

  get closedPercent(): number {
    const s = this.stats();
    if (!s || s.totalAssigned === 0) return 0;
    return (s.closed / s.totalAssigned) * 100;
  }

  calcPriorityPercent(count: number | undefined): number {
    const s = this.stats();
    if (!s || s.totalAssigned === 0 || !count) return 0;
    return Math.min(100, Math.round((count / s.totalAssigned) * 100));
  }

  getPriorityDotClass(priority: string): string {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-[#DC2626]';
      case 'HIGH':
        return 'bg-[#EA580C]';
      case 'MEDIUM':
        return 'bg-[#0284C7]';
      default:
        return 'bg-[#64748B]';
    }
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
