export type ReporterRole = 'STUDENT' | 'FACULTY' | 'STAFF' | 'CAMPUS_VISITOR';
export type ReporterStatus = 'ACTIVE' | 'INACTIVE' | 'FLAGGED';

export interface Reporter {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: ReporterRole;
  status: ReporterStatus;
  submittedTicketsCount: number;
  openTicketsCount: number;
  lastActiveAt: string;
  createdAt: string;
}
