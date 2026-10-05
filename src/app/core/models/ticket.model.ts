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
