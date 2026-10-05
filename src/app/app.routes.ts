import { Routes } from '@angular/router';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';

export const routes: Routes = [
  {
    path: '',
    component: DashboardLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
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
];
