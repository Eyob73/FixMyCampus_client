import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';

import { TicketCreateModalComponent } from '../../components/ticket-create-modal/ticket-create-modal.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent,
    TicketCreateModalComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800 flex">
      <!-- Fixed Sidebar -->
      <app-sidebar [isOpen]="sidebarOpen" (closeSidebar)="sidebarOpen = false"></app-sidebar>

      <!-- Main Layout Body -->
      <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
        <!-- Persistent Top Header -->
        <app-header
          (toggleSidebar)="sidebarOpen = !sidebarOpen"
          (openNewTicket)="showCreateModal = true"
        ></app-header>

        <!-- Main Content Canvas -->
        <main class="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Quick Ticket Creation Modal -->
      <app-ticket-create-modal
        [isOpen]="showCreateModal"
        (closeModal)="showCreateModal = false"
      ></app-ticket-create-modal>

    </div>
  `
})
export class AdminLayoutComponent {
  sidebarOpen = false;
  showCreateModal = false;
}
