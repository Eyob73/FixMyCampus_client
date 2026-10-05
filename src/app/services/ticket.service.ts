import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map, of } from 'rxjs';
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
  TicketComment,
  TicketActivity,
  TicketAttachment
} from '../models/ticket.model';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly notifService = inject(NotificationService);
  
  private readonly baseUrl = `${environment.apiUrl}/Tickets`;
  private readonly techUrl = `${environment.apiUrl}/Technician`;

  // Reactive state signals for UI reactivity
  readonly currentStats = signal<TechnicianDashboardStats | null>(null);
  readonly selectedTicket = signal<Ticket | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly lastUpdated = signal<Date>(new Date());

  private ticketsSignal = signal<Ticket[]>([]);
  readonly tickets = this.ticketsSignal.asReadonly();

  private mapBackendStatus(status: string): TicketStatus {
    const s = (status || '').toLowerCase();
    if (s === 'new') return 'NEW';
    if (s === 'inprogress' || s === 'in progress') return 'IN_PROGRESS';
    if (s === 'resolved') return 'RESOLVED';
    if (s === 'closed') return 'CLOSED';
    return 'NEW'; // default
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
      priority: 'MEDIUM', // Fallback as .NET doesn't seem to have priority
      status: this.mapBackendStatus(dto.status),
      attachments: [],
      activityLog: [],
      comments: [],
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt || dto.createdAt
    };
  }

  getDashboardStats(): Observable<TechnicianDashboardStats> {
    this.isLoading.set(true);
    return this.http.get<any>(`${this.techUrl}/dashboard`).pipe(
      map(stats => ({
        ...stats,
      })),
      tap({
        next: (stats) => {
          this.currentStats.set(stats);
          this.isLoading.set(false);
          this.lastUpdated.set(new Date());
        },
        error: () => this.isLoading.set(false),
      })
    );
  }

  getTechnicianTickets(options: TicketFilterOptions = {}): Observable<PaginatedTicketsResponse> {
    this.isLoading.set(true);
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
      }),
      tap({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false),
      })
    );
  }

  private mapBackendStatusReverse(status: string): string {
    if (status === 'in_progress') return 'InProgress';
    if (status === 'new') return 'New';
    if (status === 'resolved') return 'Resolved';
    if (status === 'closed') return 'Closed';
    return status;
  }

  getTechnicianTicketById(id: string): Observable<Ticket> {
    this.isLoading.set(true);
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(t => this.mapToTicket(t)),
      tap({
        next: (ticket) => {
          this.selectedTicket.set(ticket);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      })
    );
  }

  updateStatus(id: string, newStatus: TicketStatus, note?: string): Observable<Ticket> {
    this.isLoading.set(true);
    let endpoint = 'start';
    if (newStatus === 'RESOLVED') endpoint = 'resolve';
    
    return this.http.put<any>(`${this.techUrl}/tickets/${id}/${endpoint}`, {}).pipe(
      map(t => this.mapToTicket(t)),
      tap({
        next: (updatedTicket) => {
          this.selectedTicket.set(updatedTicket);
          this.isLoading.set(false);
          this.lastUpdated.set(new Date());
        },
        error: () => this.isLoading.set(false),
      })
    );
  }
  updatePriority(id: string, priority: string): Observable<Ticket> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/priority`, { priority }).pipe(
      map(t => this.mapToTicket(t))
    );
  }

  addInternalNote(id: string, note: string): Observable<Ticket> {
    return this.http.post<any>(`${this.baseUrl}/${id}/notes`, { note }).pipe(
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
    return this.http.post<any>(`${this.techUrl}/tickets/${id}/assign`, { technicianId: techId }).pipe(
      map(t => this.mapToTicket(t))
    );
  }

  addWorkNote(id: string, content: string, noteType: string = 'GENERAL'): Observable<Ticket> {
     // NOTE: Not supported by .NET API yet. Mocking response.
     return this.getTechnicianTicketById(id);
  }

  uploadAttachment(id: string, fileData: any): Observable<Ticket> {
     // NOTE: Not supported by .NET API yet. Mocking response.
     return this.getTechnicianTicketById(id);
  }

  getMyTickets(filter?: TicketFilter): Observable<Ticket[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my`).pipe(
      map(tickets => tickets.map(t => this.mapToTicket(t))),
      tap(mapped => this.ticketsSignal.set(mapped))
    );
  }

  getTicketStats(): Observable<TicketStats> {
    return this.getMyTickets().pipe(
      map(tickets => ({
        totalSubmitted: tickets.length,
        openCount: tickets.filter(t => t.status === 'NEW').length,
        inProgressCount: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolvedCount: tickets.filter(t => t.status === 'RESOLVED').length,
        closedCount: tickets.filter(t => t.status === 'CLOSED').length
      }))
    );
  }

  getTicketById(id: string): Observable<Ticket | null> {
    this.isLoading.set(true);
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(t => this.mapToTicket(t)),
      tap({
        next: (t) => {
          this.selectedTicket.set(t);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
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
      map(t => this.mapToTicket(t)),
      tap(backendTicket => {
        this.ticketsSignal.update(list => [backendTicket, ...list]);
        this.notifyTicketCreation(backendTicket);
      })
    );
  }

  private notifyTicketCreation(ticket: Ticket): void {
    this.notifService.addNotification({
      userId: ticket.reporterId || '',
      title: 'Ticket Submitted Successfully',
      message: `Your issue was received and queued for facility triage.`,
      type: 'ticket_created',
      ticketId: ticket.id,
      read: false
    });
  }

  addComment(ticketId: string, content: string): Observable<TicketComment> {
    return of({
      id: `c-${Date.now()}`,
      ticketId,
      authorId: 'me',
      authorName: 'Me',
      authorRole: 'reporter',
      content: content,
      createdAt: new Date().toISOString()
    });
  }

  getRecentTickets(limit = 5): Observable<Ticket[]> {
    return this.getMyTickets().pipe(
      map((tickets) => tickets.slice(0, limit))
    );
  }
}
