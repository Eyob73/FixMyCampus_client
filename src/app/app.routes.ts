import { Routes } from '@angular/router';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import { technicianGuard } from './core/guards/technician.guard';

export const routes: Routes = [
  {
    path: 'technician',
    component: DashboardLayout,
    canActivate: [technicianGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/technician/dashboard/technician-dashboard.component').then(
            (m) => m.TechnicianDashboardComponent
          ),
        title: 'Technician Dashboard | FixMyCampus',
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/technician/ticket-list/ticket-list.component').then(
            (m) => m.TicketListComponent
          ),
        title: 'My Assigned Tickets | FixMyCampus',
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./features/technician/ticket-detail/ticket-detail.component').then(
            (m) => m.TicketDetailComponent
          ),
        title: 'Work Order Details | FixMyCampus',
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'technician/dashboard',
  },
  {
    path: '**',
    redirectTo: 'technician/dashboard',
  },
];
