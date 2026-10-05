import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TicketService } from '../../core/services/ticket.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      class="fixed top-0 left-0 h-screen w-64 flex flex-col z-30 bg-white border-r border-[#E2E8F0] shadow-xs"
    >
      <div class="h-full flex flex-col justify-between p-4">
        <!-- Top Brand Header & Navigation Section -->
        <div class="flex flex-col space-y-6">
          <!-- Brand Header -->
          <div class="flex items-center space-x-3 px-2 py-1">
            <div
              class="w-10 h-10 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0"
            >
              <span class="material-symbols-outlined text-[22px]">engineering</span>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-base font-bold text-[#1E3A8A] tracking-tight leading-tight truncate">FixMyCampus</span>
              <span class="text-[11px] text-[#64748B] font-medium leading-tight truncate">Technician Workdesk</span>
            </div>
          </div>

          <!-- Role Indicator Pill -->
          <div class="px-2">
            <div class="flex items-center justify-between px-2.5 py-1.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-md text-xs text-[#1E3A8A]">
              <span class="font-semibold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
                On Duty (Technician)
              </span>
              <span class="text-[10px] font-mono text-[#3B82F6] font-semibold">T-DESK</span>
            </div>
          </div>

          <!-- Navigation Tabs Cluster -->
          <nav class="flex flex-col space-y-1">
            <!-- Tab 1: Dashboard -->
            <a
              routerLink="/technician/dashboard"
              routerLinkActive="bg-[#E5EEFF] text-[#00236F] font-semibold border-l-3 border-[#1E3A8A]"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center justify-between px-3 py-2.5 text-[#444651] hover:text-[#0B1C30] hover:bg-[#F1F5F9] rounded-lg text-sm font-medium transition-colors"
            >
              <div class="flex items-center space-x-3">
                <span class="material-symbols-outlined text-[20px]">dashboard</span>
                <span>Dashboard</span>
              </div>
            </a>

            <!-- Tab 2: My Assigned Tickets -->
            <a
              routerLink="/technician/tickets"
              routerLinkActive="bg-[#E5EEFF] text-[#00236F] font-semibold border-l-3 border-[#1E3A8A]"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center justify-between px-3 py-2.5 text-[#444651] hover:text-[#0B1C30] hover:bg-[#F1F5F9] rounded-lg text-sm font-medium transition-colors"
            >
              <div class="flex items-center space-x-3">
                <span class="material-symbols-outlined text-[20px]">confirmation_number</span>
                <span>My Tickets</span>
              </div>
              @if (ticketService.currentStats()?.newAssigned; as newCount) {
                @if (newCount > 0) {
                  <span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                    {{ newCount }}
                  </span>
                }
              }
            </a>

            <!-- Tab 3: Active In Progress -->
            <a
              [routerLink]="['/technician/tickets']"
              [queryParams]="{ status: 'IN_PROGRESS' }"
              routerLinkActive="bg-[#E5EEFF] text-[#00236F] font-semibold border-l-3 border-[#1E3A8A]"
              class="flex items-center justify-between px-3 py-2.5 text-[#444651] hover:text-[#0B1C30] hover:bg-[#F1F5F9] rounded-lg text-sm font-medium transition-colors"
            >
              <div class="flex items-center space-x-3">
                <span class="material-symbols-outlined text-[20px]">build</span>
                <span>In Progress</span>
              </div>
              @if (ticketService.currentStats()?.inProgress; as progCount) {
                <span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">
                  {{ progCount }}
                </span>
              }
            </a>

            <!-- Tab 4: Resolved History -->
            <a
              [routerLink]="['/technician/tickets']"
              [queryParams]="{ status: 'RESOLVED' }"
              routerLinkActive="bg-[#E5EEFF] text-[#00236F] font-semibold border-l-3 border-[#1E3A8A]"
              class="flex items-center justify-between px-3 py-2.5 text-[#444651] hover:text-[#0B1C30] hover:bg-[#F1F5F9] rounded-lg text-sm font-medium transition-colors"
            >
              <div class="flex items-center space-x-3">
                <span class="material-symbols-outlined text-[20px]">task_alt</span>
                <span>Resolved Work</span>
              </div>
              @if (ticketService.currentStats()?.resolved; as resCount) {
                <span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
                  {{ resCount }}
                </span>
              }
            </a>
          </nav>
        </div>

        <!-- Footer Section: Technician Profile & Logout -->
        <div class="border-t border-[#E2E8F0] pt-3 space-y-2">
          <!-- Profile Card -->
          <div class="flex items-center space-x-3 px-2 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
            <div
              class="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-xs font-bold shrink-0"
            >
              {{ userInitials }}
            </div>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-xs font-bold text-[#0F172A] truncate">{{ authService.currentUser().name }}</span>
              <span class="text-[10px] text-[#64748B] truncate">{{ authService.currentUser().department }}</span>
            </div>
          </div>

          <!-- Logout Button -->
          <button
            type="button"
            (click)="onLogout()"
            class="w-full flex items-center space-x-3 px-3 py-2 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg text-sm font-medium transition-colors"
          >
            <span class="material-symbols-outlined text-[20px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  `,
})
export class Sidebar {
  readonly authService = inject(AuthService);
  readonly ticketService = inject(TicketService);
  private readonly router = inject(Router);

  get userInitials(): string {
    const name = this.authService.currentUser().name || 'Tech';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/technician/dashboard']);
  }
}
