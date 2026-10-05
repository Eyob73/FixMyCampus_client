<<<<<<< HEAD
<<<<<<< HEAD
import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
=======
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TicketService } from '../../core/services/ticket.service';
>>>>>>> technician
=======
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
>>>>>>> admin

@Component({
  selector: 'app-header',
  standalone: true,
<<<<<<< HEAD
<<<<<<< HEAD
  imports: [CommonModule, RouterModule, FormsModule],
=======
  imports: [CommonModule, RouterModule],
>>>>>>> admin
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
<<<<<<< HEAD
  private router = inject(Router);
  private notifService = inject(NotificationService);
  private authService = inject(AuthService);

  toggleSidebar = output<void>();

  searchQuery = signal<string>('');
  showNotifMenu = signal<boolean>(false);
  showUserMenu = signal<boolean>(false);

  unreadCount = this.notifService.unreadCount;
  notifications = this.notifService.notifications;
  currentUser = this.authService.currentUser;

  onSearchSubmit(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/my-tickets'], { queryParams: { search: q } });
    }
  }

  toggleNotifs(): void {
    this.showNotifMenu.update(v => !v);
    this.showUserMenu.set(false);
  }

  toggleUser(): void {
    this.showUserMenu.update(v => !v);
    this.showNotifMenu.set(false);
  }

  closeMenus(): void {
    this.showNotifMenu.set(false);
    this.showUserMenu.set(false);
  }

  markAllAsRead(): void {
    this.notifService.markAllAsRead().subscribe();
  }

  onLogout(): void {
    this.closeMenus();
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
      this.router.navigate(['/dashboard']);
    }
=======
  imports: [CommonModule, FormsModule],
  template: `
    <header class="sticky top-0 right-0 h-16 w-full z-20 bg-white border-b border-[#E2E8F0] shadow-xs">
      <div class="flex justify-between items-center h-16 px-6 w-full">
        <!-- Left: Quick Search Bar for Assigned Tickets -->
        <div class="flex items-center flex-1 max-w-md">
          <form (submit)="onSearchSubmit($event)" class="relative w-full">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#94A3B8]">
              search
            </span>
            <input
              type="text"
              name="searchQuery"
              [(ngModel)]="searchQuery"
              placeholder="Search assigned tickets, room, reporter..."
              class="w-full pl-9 pr-4 py-1.5 h-[38px] bg-white border border-[#CBD5E1] rounded text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition-colors"
            />
          </form>
        </div>

        <!-- Right: Actions, Badges & Profile Pill -->
        <div class="flex items-center space-x-4">
          <!-- Active Ticket Status Counter Pill -->
          <div class="hidden sm:flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-full text-xs text-[#64748B]">
            <span class="w-2 h-2 rounded-full bg-[#0284C7]"></span>
            <span>In Progress: <strong class="text-[#0F172A]">{{ ticketService.currentStats()?.inProgress ?? 0 }}</strong></span>
          </div>

          <!-- Notification & Help Outlined Icons -->
          <div class="flex items-center space-x-1">
            <button
              type="button"
              (click)="toggleNotifications()"
              class="p-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors relative"
              title="System Alerts"
            >
              <span class="material-symbols-outlined text-[20px]">notifications</span>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full"></span>
            </button>
            <button
              type="button"
              (click)="toggleHelpModal()"
              class="p-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors"
              title="Technician Maintenance SOP Guide"
            >
              <span class="material-symbols-outlined text-[20px]">help_outline</span>
            </button>
          </div>

          <div class="h-6 w-px bg-[#E2E8F0]"></div>

          <!-- Technician User Profile Pill -->
          <div
            class="flex items-center space-x-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-full py-1 pl-1.5 pr-3.5 hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <div
              class="w-7 h-7 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shrink-0"
            >
              {{ userInitials }}
            </div>
            <div class="flex flex-col text-left">
              <span class="text-xs font-semibold text-[#0F172A] leading-tight">{{ authService.currentUser().name }}</span>
              <span class="text-[10px] text-[#64748B] font-medium leading-none">Maintenance Technician</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick SOP Help Modal -->
      @if (showHelpModal()) {
        <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#1E3A8A]">menu_book</span>
                <h3 class="text-base font-bold text-slate-900">Technician Standard Operating Procedures</h3>
              </div>
              <button (click)="showHelpModal.set(false)" class="text-slate-400 hover:text-slate-600">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="space-y-3 text-sm text-slate-600 leading-relaxed">
              <div class="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <h4 class="font-semibold text-blue-900 text-xs uppercase tracking-wider mb-1">Status Workflow Guidelines</h4>
                <p class="text-xs text-blue-800">
                  <strong>Assigned:</strong> Ticket has been dispatched to you. Click <em>Start Work</em> when arriving on site.<br>
                  <strong>In Progress:</strong> Active repair underway. Post diagnostic notes and required materials.<br>
                  <strong>Resolved:</strong> Work physically verified and completed. Required resolution summary must be entered.
                </p>
              </div>
              <div class="space-y-1.5 text-xs">
                <p><strong>Emergency Contacts:</strong> Central Facilities Dispatch: x4400 | Safety Office: x4491</p>
                <p><strong>Evidence Photos:</strong> Upload clear before/after pictures for all equipment replacements.</p>
              </div>
            </div>
            <div class="flex justify-end pt-2">
              <button
                type="button"
                (click)="showHelpModal.set(false)"
                class="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8]"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      }
    </header>
  `,
})
export class Header {
  readonly authService = inject(AuthService);
  readonly ticketService = inject(TicketService);
  private readonly router = inject(Router);

  searchQuery = '';
  readonly showHelpModal = signal<boolean>(false);

  get userInitials(): string {
    const name = this.authService.currentUser().name || 'Tech';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      this.router.navigate(['/technician/tickets'], {
        queryParams: { search: this.searchQuery.trim() },
      });
    }
  }

  toggleNotifications(): void {
    // Navigates or refreshes assigned tickets
    this.router.navigate(['/technician/tickets'], {
      queryParams: { priority: 'CRITICAL' },
    });
  }

  toggleHelpModal(): void {
    this.showHelpModal.update((v) => !v);
>>>>>>> technician
=======
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() openNewTicket = new EventEmitter<void>();

  showNotifications = false;

  constructor(
    public authService: AuthService,
    public ticketService: TicketService,
    private router: Router
  ) {}

  get notifications(): Array<{ id: string; title: string; time: string; icon: string; type: string }> {
    return [
      {
        id: '1',
        title: 'Emergency: Lab 304 temp spike above 78°F',
        time: '12m ago',
        icon: 'error',
        type: 'danger'
      },
      {
        id: '2',
        title: 'Ticket #T-1078 was marked Resolved by James Reynolds',
        time: '45m ago',
        icon: 'check_circle',
        type: 'success'
      },
      {
        id: '3',
        title: 'Hydraulic maintenance scheduled for Founders Tower',
        time: '2h ago',
        icon: 'schedule',
        type: 'info'
      }
    ];
  }

  toggleNotifs(): void {
    this.showNotifications = !this.showNotifications;
  }

  closeNotifs(): void {
    this.showNotifications = false;
  }

  goToTickets(): void {
    this.closeNotifs();
    this.router.navigate(['/admin/tickets']);
>>>>>>> admin
  }
}
