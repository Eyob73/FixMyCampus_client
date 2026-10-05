<<<<<<< HEAD
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';
=======
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
>>>>>>> technician

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
<<<<<<< HEAD
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
=======
  imports: [CommonModule, RouterOutlet, Sidebar, Header],
  template: `
    <div class="bg-[#F8FAFC] text-[#0F172A] antialiased min-h-screen flex">
      <!-- Fixed Sidebar (256px wide) -->
      <app-sidebar />

      <!-- Main Operational Area (Shifted 256px) -->
      <div class="flex-1 ml-64 flex flex-col min-h-screen">
        <app-header />

        <!-- Main Workspace Canvas (max 1600px) -->
        <main class="flex-1 p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
>>>>>>> technician
})
export class DashboardLayout {
  sidebarOpen = signal<boolean>(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
