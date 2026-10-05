export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'REPORTER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  departmentOrHall?: string;
  phone?: string;
  affiliation?: string;
  accountStatus?: string;
  notificationPreferences?: any;
  isActive?: boolean;
}

export interface UpdateProfileDto {
  name: string;
  phone?: string;
  departmentOrHall?: string;
  affiliation?: string;
  notificationPreferences?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}
