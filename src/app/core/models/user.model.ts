export type UserRole = 'reporter' | 'technician' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  affiliation: string; // e.g. 'Student / Undergraduate', 'Faculty', 'Resident'
  departmentOrHall: string; // e.g. 'North Residential Hall', 'Computer Science'
  avatarUrl?: string;
  accountStatus: 'active' | 'inactive' | 'verified';
  createdAt: string;
  notificationPreferences?: {
    email: boolean;
    ticketStatusChanges: boolean;
    ticketComments: boolean;
    campusAlerts: boolean;
  };
}

export interface UpdateProfileDto {
  name: string;
  phone?: string;
  departmentOrHall?: string;
  affiliation?: string;
  notificationPreferences?: {
    email: boolean;
    ticketStatusChanges: boolean;
    ticketComments: boolean;
    campusAlerts: boolean;
  };
}
