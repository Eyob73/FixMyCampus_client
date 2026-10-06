import { TicketCategory, TicketPriority } from './ticket.model';

export interface DashboardMetrics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  unassignedTickets: number;
  avgResolutionHours: number;
  slaComplianceRate: number; // percentage, e.g. 94.2
}

export interface CategoryMetric {
  category: TicketCategory;
  count: number;
  percentage: number;
}

export interface PriorityMetric {
  priority: TicketPriority;
  count: number;
  color: string;
}

export interface WeeklyVelocity {
  day: string;
  created: number;
  resolved: number;
}

export interface ReporterDashboardDto {
  totalTickets: number;
  newTickets: number;
  assignedTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
}

export interface AdminDashboardDto {
  totalTickets: number;
  newTickets: number;
  assignedTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  unassignedTickets: number;
  recentTickets: any[]; // Or Ticket[]
}

export interface TechnicianDashboardDto {
  totalAssigned: number;
  newAssigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
  highPriority: number;
  priorityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recentTickets: any[];
}
