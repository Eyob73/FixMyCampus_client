export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'NewIssueReported' | 'IssueAssigned' | 'IssueInProgress' | 'IssueResolved' | string;
  ticketId?: string;
  read: boolean;
  isRead?: boolean;
  createdAt: string;
  readAt?: string;
  ticketTitle?: string;
  ticketCategory?: string;
  ticketBuilding?: string;
  ticketStatus?: string;
}
