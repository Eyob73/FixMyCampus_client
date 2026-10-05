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
