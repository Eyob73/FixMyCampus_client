import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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
      <main class="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 sm:p-8 shadow-xs">
          <div class="flex items-start justify-between flex-wrap gap-4 border-b border-outline-variant pb-4">
            <div>
              <h2 class="text-xl font-bold text-on-surface">Campus Issue Reporting</h2>
              <p class="text-xs text-on-surface-variant mt-1">Submit facilities maintenance requests and track resolution status in real-time.</p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Dispatch Open
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant">
              <span class="material-symbols-outlined text-2xl text-primary mb-2">add_task</span>
              <h3 class="text-sm font-semibold text-on-surface">Submit New Request</h3>
              <p class="text-xs text-on-surface-variant mt-1">Report electrical, plumbing, HVAC, or structural campus issues.</p>
            </div>
            <div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant">
              <span class="material-symbols-outlined text-2xl text-secondary mb-2">pending_actions</span>
              <h3 class="text-sm font-semibold text-on-surface">Active Reports</h3>
              <p class="text-xs text-on-surface-variant mt-1">Track progress on issues submitted by your department.</p>
            </div>
            <div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant">
              <span class="material-symbols-outlined text-2xl text-tertiary-container mb-2">verified</span>
              <h3 class="text-sm font-semibold text-on-surface">Resolved Tickets</h3>
              <p class="text-xs text-on-surface-variant mt-1">Review inspection sign-offs and completed maintenance work orders.</p>
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
export class ReporterDashboardComponent {
  constructor(public authService: AuthService) {}
}
