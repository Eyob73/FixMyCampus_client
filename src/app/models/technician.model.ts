export type TechnicianStatus = 'AVAILABLE' | 'BUSY' | 'ON_CALL' | 'OFF_DUTY';

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  department: string;
  specialty: string; // e.g. "HVAC & Climate Control", "Master Electrician", "Plumbing"
  status: TechnicianStatus;
  assignedTicketCount: number;
  activeTicketsCount: number;
  resolvedTicketsCount: number;
  rating?: number;
  createdAt: string;
}

export interface CreateTechnicianDto {
  name: string;
  email: string;
  phone: string;
  department: string;
  specialty: string;
  status: TechnicianStatus;
}

export interface UpdateTechnicianDto extends Partial<CreateTechnicianDto> {
  id: string;
}
