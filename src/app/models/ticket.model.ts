export type TicketStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory = 'HVAC' | 'PLUMBING' | 'ELECTRICAL' | 'STRUCTURAL' | 'IT_SECURITY' | 'GROUNDS' | 'GENERAL';

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  action: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  comment?: string;
  previousStatus?: TicketStatus;
  newStatus?: TicketStatus;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. "T-1082"
  title: string;
  description: string;
  category: TicketCategory;
  building: string;
  floor?: string;
  room?: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  reporterRole?: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  assignedTechnicianAvatar?: string;
  assignedTechnicianSpecialty?: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  attachments?: TicketAttachment[];
  activityLog?: TicketActivity[];
  internalNotes?: string[];
  estimatedHours?: number;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  category: TicketCategory;
  building: string;
  floor?: string;
  room?: string;
  priority: TicketPriority;
  assignedTechnicianId?: string;
  reporterName?: string;
  reporterEmail?: string;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  category?: TicketCategory;
  building?: string;
  floor?: string;
  room?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignedTechnicianId?: string;
  internalNotes?: string[];
}

export interface AssignTechnicianDto {
  ticketId: string;
  technicianId: string;
  notes?: string;
}

export interface TicketFilterParams {
  search?: string;
  status?: TicketStatus | 'ALL';
  priority?: TicketPriority | 'ALL';
  category?: TicketCategory | 'ALL';
  building?: string;
  assignedTechnicianId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
