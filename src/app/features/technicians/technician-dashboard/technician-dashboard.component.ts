import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-technician-dashboard',
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
            <span class="text-[11px] text-on-surface-variant">Technician Work Orders</span>
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
              <h2 class="text-xl font-bold text-on-surface">Assigned Field Tickets</h2>
              <p class="text-xs text-on-surface-variant mt-1">Review active work orders, update triage notes, and mark repairs complete.</p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              On Duty
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant">
              <span class="material-symbols-outlined text-2xl text-amber-600 mb-2">assignment</span>
              <h3 class="text-sm font-semibold text-on-surface">Assigned Queue</h3>
              <p class="text-xs text-on-surface-variant mt-1">Work orders waiting for on-site triage and component diagnostics.</p>
            </div>
            <div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant">
              <span class="material-symbols-outlined text-2xl text-sky-600 mb-2">build</span>
              <h3 class="text-sm font-semibold text-on-surface">In-Progress Repairs</h3>
              <p class="text-xs text-on-surface-variant mt-1">Active repair orders currently undergoing physical remediation.</p>
            </div>
            <div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant">
              <span class="material-symbols-outlined text-2xl text-emerald-600 mb-2">task_alt</span>
              <h3 class="text-sm font-semibold text-on-surface">Completed Jobs</h3>
              <p class="text-xs text-on-surface-variant mt-1">Resolved maintenance tickets awaiting supervisory quality signoff.</p>
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
export class TechnicianDashboardComponent {
  constructor(public authService: AuthService) {}
}
