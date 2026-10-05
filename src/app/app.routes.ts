import { Routes } from '@angular/router';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
<<<<<<< HEAD

export const routes: Routes = [
  {
    path: '',
    component: DashboardLayout,
=======
import { technicianGuard } from './core/guards/technician.guard';

export const routes: Routes = [
  {
    path: 'technician',
    component: DashboardLayout,
    canActivate: [technicianGuard],
>>>>>>> technician
    children: [
      {
        path: '',
        pathMatch: 'full',
<<<<<<< HEAD
        redirectTo: 'dashboard'
=======
        redirectTo: 'dashboard',
>>>>>>> technician
      },
      {
        path: 'dashboard',
        loadComponent: () =>
<<<<<<< HEAD
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'FixMyCampus - Reporter Dashboard'
      },
      {
        path: 'report-issue',
        loadComponent: () =>
          import('./pages/report-issue/report-issue.component').then(
            (m) => m.ReportIssueComponent
          ),
        title: 'FixMyCampus - Report Campus Issue'
      },
      {
        path: 'my-tickets',
        loadComponent: () =>
          import('./pages/my-tickets/my-tickets.component').then((m) => m.MyTicketsComponent),
        title: 'FixMyCampus - My Submitted Tickets'
      },
      {
        path: 'ticket/:id',
        loadComponent: () =>
          import('./pages/ticket-details/ticket-details.component').then(
            (m) => m.TicketDetailsComponent
          ),
        title: 'FixMyCampus - Ticket Details'
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications.component').then(
            (m) => m.NotificationsComponent
          ),
        title: 'FixMyCampus - Notifications'
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
        title: 'FixMyCampus - Reporter Profile'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
=======
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
>>>>>>> technician
];
