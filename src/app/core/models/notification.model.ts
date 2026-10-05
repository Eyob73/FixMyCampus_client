export type NotificationType =
  | 'ticket_created'
  | 'ticket_assigned'
  | 'status_changed'
  | 'ticket_resolved'
  | 'ticket_closed'
  | 'new_comment'
  | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  ticketId?: string;
  read: boolean;
  createdAt: string;
}
