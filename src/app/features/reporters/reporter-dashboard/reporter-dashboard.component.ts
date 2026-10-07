import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DashboardStore } from '../../../store/dashboard.store';
@Component({
  selector: 'app-reporter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-background text-on-surface antialiased flex flex-col justify-between">
      <!-- Top Utility Header -->
      <header class="w-full border-b border-outline-variant bg-surface-container-lowest px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary border border-outline-variant shadow-2xs">
            <span class="material-symbols-outlined text-[22px]" style="font-variation-settings: 'FILL' 1;">handyman</span>
          </div>
          <div>
            <h1 class="text-base font-bold text-primary leading-tight">FixMyCampus</h1>
            <span class="text-[11px] text-on-surface-variant">Reporter Portal</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          @if (authService.currentUser(); as user) {
            <div class="flex items-center gap-2 pr-2 border-r border-outline-variant">
              <span class="text-xs font-semibold text-on-surface">{{ user.name }}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container text-primary border border-outline-variant">
                {{ user.role }}
              </span>
            </div>
          }
          <button
            type="button"
            (click)="authService.logout()"
            class="px-3 py-1.5 text-xs font-medium text-error hover:bg-error-container/20 rounded border border-error/30 transition-colors flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <!-- Main Portal Body -->
      <main class="flex-1 w-full p-4 sm:p-6">
        <div class="w-full py-2">
          <div class="bg-surface-container-lowest border border-outline-variant rounded-[14px] p-5 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-outline-variant pb-3 flex-wrap gap-4">
              <div>
                <h2 class="text-[17px] font-semibold text-on-surface m-0">Campus Issue Reporting</h2>
                <p class="text-[13.5px] text-on-surface-variant m-0 mt-[3px]">Submit facilities maintenance requests and track resolution status in real-time.</p>
              </div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Dispatch Open
              </span>
            </div>

            <div class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[14px]">
              <a routerLink="/reporter/tickets/new" class="block p-[1.125rem_1.25rem] rounded-[14px] bg-surface-container-low border border-outline-variant hover:border-primary hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-200 cursor-pointer group">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="material-symbols-outlined text-[1.5rem] text-primary mb-2 group-hover:scale-110 transition-transform">add_task</span>
                    <h3 class="text-[0.9rem] font-semibold text-on-surface tracking-tight m-0">Submit New Request</h3>
                    <p class="text-[0.775rem] text-on-surface-variant mt-1 mb-0">Report electrical, plumbing, HVAC, or structural campus issues.</p>
                  </div>
                  <span class="text-[1.5rem] font-bold font-mono text-primary leading-none">{{ dashboardStore.reporterStats()?.totalTickets ?? 0 }}</span>
                </div>
              </a>
              <a routerLink="/reporter/tickets" [queryParams]="{ status: 'OPEN' }" class="block p-[1.125rem_1.25rem] rounded-[14px] bg-surface-container-low border border-outline-variant hover:border-secondary hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-200 cursor-pointer group">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="material-symbols-outlined text-[1.5rem] text-secondary mb-2 group-hover:scale-110 transition-transform">pending_actions</span>
                    <h3 class="text-[0.9rem] font-semibold text-on-surface tracking-tight m-0">Active Reports</h3>
                    <p class="text-[0.775rem] text-on-surface-variant mt-1 mb-0">Track progress on issues submitted by your department.</p>
                  </div>
                  <span class="text-[1.5rem] font-bold font-mono text-secondary leading-none">{{ (dashboardStore.reporterStats()?.newTickets ?? 0) + (dashboardStore.reporterStats()?.assignedTickets ?? 0) + (dashboardStore.reporterStats()?.inProgressTickets ?? 0) }}</span>
                </div>
              </a>
              <a routerLink="/reporter/tickets" [queryParams]="{ status: 'RESOLVED' }" class="block p-[1.125rem_1.25rem] rounded-[14px] bg-surface-container-low border border-outline-variant hover:border-tertiary-container hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-200 cursor-pointer group">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="material-symbols-outlined text-[1.5rem] text-tertiary-container mb-2 group-hover:scale-110 transition-transform">verified</span>
                    <h3 class="text-[0.9rem] font-semibold text-on-surface tracking-tight m-0">Resolved Tickets</h3>
                    <p class="text-[0.775rem] text-on-surface-variant mt-1 mb-0">Review inspection sign-offs and completed maintenance work orders.</p>
                  </div>
                  <span class="text-[1.5rem] font-bold font-mono text-tertiary-container leading-none">{{ dashboardStore.reporterStats()?.resolvedTickets ?? 0 }}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>

      <!-- Institutional Footer -->
      <footer class="w-full border-t border-outline-variant bg-surface-container-lowest py-3.5 px-4 sm:px-6 text-center text-xs text-on-surface-variant">
        <span>© 2025 University Physical Plant &amp; Campus Services. All rights reserved.</span>
      </footer>
    </div>
  `
})
export class ReporterDashboardComponent implements OnInit {
  readonly dashboardStore = inject(DashboardStore);

  constructor(
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.dashboardStore.loadReporterStats();
  }
}
