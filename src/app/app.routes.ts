import { Routes } from '@angular/router';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { technicianGuard } from './core/guards/technician.guard';
import { adminGuard } from './core/guards/admin.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
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
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'tickets',
        loadComponent: () => import('./features/admin/tickets/ticket-list/ticket-list.component').then((m) => m.TicketListComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () => import('./features/admin/tickets/ticket-detail/ticket-detail.component').then((m) => m.TicketDetailComponent)
      },
      {
        path: 'technicians',
        loadComponent: () => import('./features/admin/technicians/technician-list/technician-list.component').then((m) => m.TechnicianListComponent)
      },
      {
        path: 'reporters',
        loadComponent: () => import('./features/admin/reporters/reporter-list/reporter-list.component').then((m) => m.ReporterListComponent)
      },
      {
        path: 'buildings',
        loadComponent: () => import('./features/admin/buildings/building-list/building-list.component').then((m) => m.BuildingListComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/reports/reports.component').then((m) => m.ReportsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/settings.component').then((m) => m.SettingsComponent)
      }
    ]
  },
  {
    path: 'reporter',
    component: DashboardLayout,
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
          import('./features/reporter/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'FixMyCampus - Reporter Dashboard'
      },
      {
        path: 'report-issue',
        loadComponent: () =>
          import('./features/reporter/report-issue/report-issue.component').then(
            (m) => m.ReportIssueComponent
          ),
        title: 'FixMyCampus - Report Campus Issue'
      },
      {
        path: 'my-tickets',
        loadComponent: () =>
          import('./features/reporter/my-tickets/my-tickets.component').then((m) => m.MyTicketsComponent),
        title: 'FixMyCampus - My Submitted Tickets'
      },
      {
        path: 'ticket/:id',
        loadComponent: () =>
          import('./features/reporter/ticket-details/ticket-details.component').then(
            (m) => m.TicketDetailsComponent
          ),
        title: 'FixMyCampus - Ticket Details'
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/reporter/notifications/notifications.component').then(
            (m) => m.NotificationsComponent
          ),
        title: 'FixMyCampus - Notifications'
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/reporter/profile/profile.component').then((m) => m.ProfileComponent),
        title: 'FixMyCampus - Reporter Profile'
      }
    ]
  },
  {
    path: 'technician',
    component: DashboardLayout,
    canActivate: [technicianGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/technician/dashboard/technician-dashboard.component').then(
            (m) => m.TechnicianDashboardComponent
          ),
        title: 'Technician Dashboard | FixMyCampus'
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/technician/ticket-list/ticket-list.component').then(
            (m) => m.TicketListComponent
          ),
        title: 'My Assigned Tickets | FixMyCampus'
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./features/technician/ticket-detail/ticket-detail.component').then(
            (m) => m.TicketDetailComponent
          ),
        title: 'Work Order Details | FixMyCampus'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
