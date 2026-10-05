import { Routes } from '@angular/router';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import { AdminLayoutComponent } from './layout';
import { adminGuard, roleGuard } from './guards';

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
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'tickets',
        loadComponent: () => import('./features/tickets/ticket-list/ticket-list.component').then((m) => m.TicketListComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () => import('./features/tickets/ticket-detail/ticket-detail.component').then((m) => m.TicketDetailComponent)
      },
      {
        path: 'technicians',
        loadComponent: () => import('./features/technicians/technician-list/technician-list.component').then((m) => m.TechnicianListComponent)
      },
      {
        path: 'reporters',
        loadComponent: () => import('./features/reporters/reporter-list/reporter-list.component').then((m) => m.ReporterListComponent)
      },
      {
        path: 'buildings',
        loadComponent: () => import('./features/buildings/building-list/building-list.component').then((m) => m.BuildingListComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then((m) => m.ReportsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent)
      }
    ]
  },
  {
    path: 'reporter',
    canActivate: [roleGuard(['REPORTER'])],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/reporters/reporter-dashboard/reporter-dashboard.component').then(
            (m) => m.ReporterDashboardComponent
          )
      }
    ]
  },
  {
    path: 'technician',
    canActivate: [roleGuard(['TECHNICIAN'])],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/technicians/technician-dashboard/technician-dashboard.component').then(
            (m) => m.TechnicianDashboardComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
    redirectTo: 'login'
  }
];
