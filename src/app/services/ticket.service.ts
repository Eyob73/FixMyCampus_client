import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, forkJoin, catchError, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Ticket,
  TechnicianDashboardStats,
  TicketFilterOptions,
  PaginatedTicketsResponse,
  TicketStatus,
  TicketResolution,
  TicketStats,
  CreateTicketDto,
  TicketFilter,
  TicketComment
} from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly http = inject(HttpClient);
  
  private readonly baseUrl = `${environment.apiUrl}/Tickets`;
  private readonly techUrl = `${environment.apiUrl}/Technician`;
  private readonly adminUrl = `${environment.apiUrl}/Admin`;

  private mapBackendStatus(status: string): TicketStatus {
    const s = (status || '').toLowerCase();
    if (s === 'new') return 'NEW';
    if (s === 'inprogress' || s === 'in progress') return 'IN_PROGRESS';
    if (s === 'resolved') return 'RESOLVED';
    if (s === 'closed') return 'CLOSED';
    return 'NEW';
  }

  private mapToTicket(dto: any): Ticket {
    return {
      id: dto.id,
      ticketNumber: dto.id.toString(),
      reporterId: dto.reporter?.id,
      reporterName: dto.reporter?.firstName ? `${dto.reporter.firstName} ${dto.reporter.lastName}` : (dto.reporter?.email || 'Unknown'),
      reporterEmail: dto.reporter?.email,
      title: dto.description?.substring(0, 50) || `${dto.category} Issue`,
      description: dto.description,
      category: dto.category,
      building: dto.building,
      room: dto.room,
      priority: 'MEDIUM',
      status: this.mapBackendStatus(dto.status),
      attachments: [],
      activityLog: [],
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt || dto.createdAt,
      comments: dto.comments || [],
      internalNotes: dto.internalNotes || []
    };
  }

  private mapToActivityLog(history: any[]): any[] {
    if (!history) return [];
    return history.map(h => {
      let type = 'STATUS_CHANGE';
      if (h.newStatus && h.newStatus.toLowerCase() === 'resolved') type = 'RESOLUTION';
      
      return {
        id: h.id,
        ticketId: h.ticketId,
        action: h.oldStatus ? `Status changed to ${this.mapBackendStatus(h.newStatus)}` : 'Ticket Created',
        type: type,
        actorName: h.changedBy?.fullName || h.changedBy?.email || 'System',
        actorRole: 'System',
        timestamp: h.changedAt,
        comment: h.note,
        previousStatus: h.oldStatus ? this.mapBackendStatus(h.oldStatus) : undefined,
        newStatus: h.newStatus ? this.mapBackendStatus(h.newStatus) : undefined,
        metadata: { newStatus: h.newStatus ? this.mapBackendStatus(h.newStatus) : 'Created' }
      };
    });
  }

  getDashboardStats(): Observable<TechnicianDashboardStats> {
    return this.http.get<any>(`${this.techUrl}/dashboard`).pipe(
      map(stats => ({ ...stats }))
    );
  }

  private mapBackendStatusReverse(status: string): string {
    if (status === 'in_progress') return 'InProgress';
    if (status === 'new') return 'New';
    if (status === 'resolved') return 'Resolved';
    if (status === 'closed') return 'Closed';
    return status;
  }

  getTechnicianTickets(options: TicketFilterOptions = {}): Observable<PaginatedTicketsResponse> {
    let params = new HttpParams();

    if (options.status && options.status !== 'ALL') params = params.set('status', this.mapBackendStatusReverse(options.status));
    if (options.category && options.category !== 'ALL') params = params.set('category', options.category);
    if (options.building && options.building !== 'ALL') params = params.set('building', options.building);
    
    return this.http.get<any[]>(`${this.techUrl}/tickets`, { params }).pipe(
      map(tickets => {
        const mapped = tickets.map(t => this.mapToTicket(t));
        return {
           tickets: mapped,
           total: mapped.length,
           page: 1,
           pageSize: Math.max(1, mapped.length),
           totalPages: 1
        };
      })
    );
  }

  getTechnicianTicketById(id: string): Observable<Ticket> {
    return forkJoin({
      ticket: this.http.get<any>(`${this.baseUrl}/${id}`),
      history: this.http.get<any[]>(`${this.baseUrl}/${id}/history`).pipe(catchError(() => of([])))
    }).pipe(
      map(({ ticket, history }) => {
        const t = this.mapToTicket(ticket);
        t.activityLog = this.mapToActivityLog(history);
        return t;
      })
    );
  }

  updateStatus(id: string, newStatus: TicketStatus, note?: string): Observable<Ticket> {
    let endpoint = 'start';
    let body: any = {};
    if (newStatus === 'RESOLVED') {
      endpoint = 'resolve';
      body = { resolutionNote: note };
    }
    
    return this.http.put<any>(`${this.techUrl}/tickets/${id}/${endpoint}`, body).pipe(
      switchMap(() => this.getTechnicianTicketById(id))
    );
  }
  
  updatePriority(id: string, priority: string): Observable<Ticket> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/priority`, { priority }).pipe(
      map(t => this.mapToTicket(t))
    );
  }

  addInternalNote(id: string, note: string): Observable<Ticket> {
    return this.http.post<any>(`${this.baseUrl}/${id}/internal-notes`, { note }).pipe(
      map(t => this.mapToTicket(t))
    );
  }

  deleteTicket(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  resolveTicket(
    id: string,
    resolution: Omit<TicketResolution, 'resolvedAt' | 'resolvedBy'>
  ): Observable<Ticket> {
    return this.updateStatus(id, 'RESOLVED', resolution.resolutionDescription);
  }

  assignTechnician(id: string, techId: string, techName: string, techSpecialty: string): Observable<Ticket> {
    return this.http.put<any>(`${this.adminUrl}/tickets/${id}/assign`, { technicianId: techId }).pipe(
      map(t => this.mapToTicket(t))
    );
  }

  addWorkNote(id: string, content: string, noteType: string = 'GENERAL'): Observable<Ticket> {
     return this.getTechnicianTicketById(id);
  }

  uploadAttachment(id: string, fileData: any): Observable<Ticket> {
     return this.getTechnicianTicketById(id);
  }

  getMyTickets(filter?: TicketFilter): Observable<Ticket[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my`).pipe(
      map(tickets => tickets.map(t => this.mapToTicket(t)))
    );
  }

  getTickets(): Observable<Ticket[]> {
    return this.http.get<any[]>(`${this.baseUrl}`).pipe(
      map(tickets => tickets.map(t => this.mapToTicket(t)))
    );
  }

  getTicketById(id: string): Observable<Ticket> {
    return forkJoin({
      ticket: this.http.get<any>(`${this.baseUrl}/${id}`),
      history: this.http.get<any[]>(`${this.baseUrl}/${id}/history`).pipe(catchError(() => of([])))
    }).pipe(
      map(({ ticket, history }) => {
        const t = this.mapToTicket(ticket);
        t.activityLog = this.mapToActivityLog(history);
        return t;
      })
    );
  }

  createTicket(dto: CreateTicketDto): Observable<Ticket> {
    const payload = {
      category: dto.category,
      building: dto.building,
      room: dto.room,
      description: dto.description
    };

    return this.http.post<any>(`${this.baseUrl}`, payload).pipe(
      map(t => this.mapToTicket(t))
    );
  }

  addComment(ticketId: string, content: string): Observable<TicketComment> {
    return this.http.post<TicketComment>(`${this.baseUrl}/${ticketId}/comments`, { content });
  }
}
