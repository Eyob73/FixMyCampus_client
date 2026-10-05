export type TicketStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketCategory =
  | 'Electrical'
  | 'HVAC & Heating'
  | 'Plumbing'
  | 'Equipment & AV'
  | 'Structural & Doors'
  | 'Safety & Security'
  | 'Grounds & Sanitation'
  | 'Network & IT';

export type WorkNoteType =
  | 'DIAGNOSIS'
  | 'WORK_PERFORMED'
  | 'MATERIALS_REQUIRED'
  | 'DELAY_REASON'
  | 'GENERAL'
  | 'RESOLUTION';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TECHNICIAN' | 'ADMIN' | 'REPORTER';
  department?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface ReporterInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  studentStaffId?: string;
  role: string;
  department?: string;
  avatarUrl?: string;
}

export interface LocationInfo {
  building: string;
  room?: string;
  floor?: string;
  campusZone?: string;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  isEvidence?: boolean;
  thumbnailUrl?: string;
export type TicketStatus = 'new' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'HVAC / Climate'
  | 'Equipment'
  | 'Furniture'
  | 'Structural & Doors'
  | 'Network & Wi-Fi'
  | 'Cleaning & Grounds'
  | 'Safety & Locks'
  | 'Other';

export interface TicketAttachment {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  type: string; // e.g. 'image/png', 'image/jpeg'
  uploadedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: 'reporter' | 'technician' | 'admin';
  content: string;
  createdAt: string;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  type: 'STATUS_CHANGE' | 'WORK_NOTE' | 'REPORTER_UPDATE' | 'EVIDENCE_UPLOAD' | 'ASSIGNMENT' | 'RESOLUTION';
  noteType?: WorkNoteType;
  author: {
    id: string;
    name: string;
    role: 'TECHNICIAN' | 'ADMIN' | 'REPORTER' | 'SYSTEM';
    department?: string;
    avatarUrl?: string;
  };
  timestamp: string;
  content: string;
  metadata?: {
    oldStatus?: TicketStatus;
    newStatus?: TicketStatus;
    fileName?: string;
    fileSize?: string;
    materials?: string;
  };
}

export interface TicketResolution {
  resolvedAt: string;
  resolvedBy: string;
  resolutionDescription: string;
  workPerformed: string;
  materialsUsed?: string;
  additionalNotes?: string;
  evidenceAttachments?: TicketAttachment[];
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  location: LocationInfo;
  reporter: ReporterInfo;
  assignedTechnician?: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  createdAt: string;
  assignedAt: string;
  updatedAt: string;
  dueDate?: string;
  attachments: TicketAttachment[];
  activities: TicketActivity[];
  resolution?: TicketResolution;
}

export interface TechnicianDashboardStats {
  totalAssigned: number;
  newAssigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
  highPriority: number;
  avgResolutionHours: number;
  slaComplianceRate: number;
  priorityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  statusCounts: {
    assigned: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
}

export interface TicketFilterOptions {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  building?: string;
  dateRange?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'priority' | 'createdAt' | 'updatedAt' | 'id';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  status: TicketStatus;
  title: string;
  description: string;
  timestamp: string;
  actorName?: string;
  actorRole?: string;
}

export interface Ticket {
  id: string; // e.g., 'T-1082'
  reporterId: string;
  reporterName: string;
  reporterEmail?: string;
  title: string;
  description: string;
  category: TicketCategory;
  building: string;
  room: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTechnician?: {
    id: string;
    name: string;
    avatarUrl?: string;
    specialty?: string;
    phone?: string;
  };
  attachments: TicketAttachment[];
  comments: TicketComment[];
  activities: TicketActivity[];
  additionalDetails?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  category: TicketCategory;
  building: string;
  room: string;
  priority?: TicketPriority;
  attachments?: File[] | TicketAttachment[];
  additionalDetails?: string;
}

export interface TicketFilter {
  search?: string;
  status?: TicketStatus | 'all';
  category?: string | 'all';
  building?: string | 'all';
  priority?: TicketPriority | 'all';
  sortBy?: 'created_desc' | 'created_asc' | 'updated_desc';
}

export interface TicketStats {
  totalSubmitted: number;
  openCount: number; // 'new'
  inProgressCount: number; // 'in_progress' + 'assigned'
  resolvedCount: number; // 'resolved'
  closedCount: number; // 'closed'
}
