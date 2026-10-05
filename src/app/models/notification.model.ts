export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ticket_assigned' | 'status_changed' | 'ticket_resolved' | 'ticket_closed' | 'new_comment' | 'ticket_created' | string;
  ticketId?: string;
  read: boolean;
  createdAt: string;
}
