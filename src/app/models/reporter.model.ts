export type ReporterRole = 'STUDENT' | 'FACULTY' | 'STAFF' | 'CAMPUS_VISITOR' | 'REPORTER';
export type ReporterStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'INACTIVE';

export interface Reporter {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: ReporterStatus;
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  submittedTicketsCount: number;
  openTicketsCount: number;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReporterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  password?: string;
}

export interface UpdateReporterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
}

export interface ReporterQueryParameters {
  search?: string;
  status?: string;
  sortBy?: string;
  sortDescending?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ReporterTicketSummary {
  id: string;
  title: string;
  category: string;
  building: string;
  floor?: string;
  room?: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReporterDetail extends Reporter {
  tickets: ReporterTicketSummary[];
  newTicketsCount: number;
  assignedTicketsCount: number;
  inProgressTicketsCount: number;
  resolvedTicketsCount: number;
  closedTicketsCount: number;
}

export interface ReporterStats {
  totalReporters: number;
  activeReporters: number;
  suspendedReporters: number;
  deactivatedReporters: number;
}
