<<<<<<< HEAD
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError, map } from 'rxjs';
import {
  Ticket,
  TicketStats,
  CreateTicketDto,
  TicketFilter,
  TicketComment,
  TicketActivity,
  TicketAttachment
} from '../models/ticket.model';
import { INITIAL_TICKETS } from './mock-data';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';

const TICKETS_STORAGE_KEY = 'fixmycampus_tickets';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private ticketsSignal = signal<Ticket[]>(this.loadInitial());
  readonly tickets = this.ticketsSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notifService: NotificationService
  ) {}

  private loadInitial(): Ticket[] {
    try {
      const stored = localStorage.getItem(TICKETS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read tickets from storage', e);
    }
    return [...INITIAL_TICKETS];
  }

  private persist(tickets: Ticket[]): void {
    this.ticketsSignal.set(tickets);
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    } catch (e) {
      console.warn('Could not save tickets to storage', e);
    }
  }

  /**
   * Retrieves tickets submitted ONLY by the currently authenticated reporter.
   */
  getMyTickets(filter?: TicketFilter): Observable<Ticket[]> {
    const currentUser = this.authService.getCurrentUser();
    let params = new HttpParams().set('reporterId', currentUser.id);

    if (filter) {
      if (filter.status && filter.status !== 'all') params = params.set('status', filter.status);
      if (filter.category && filter.category !== 'all') params = params.set('category', filter.category);
      if (filter.building && filter.building !== 'all') params = params.set('building', filter.building);
      if (filter.search) params = params.set('search', filter.search);
    }

    return this.http.get<Ticket[]>(`${environment.apiUrl}/tickets/my-tickets`, { params }).pipe(
      tap((backendTickets) => {
        if (Array.isArray(backendTickets)) {
          // Merge or update local state
          const others = this.ticketsSignal().filter(t => t.reporterId !== currentUser.id);
          this.persist([...backendTickets, ...others]);
        }
      }),
      catchError(() => {
        // Filter local in-memory/localStorage tickets strictly for current user
        return of(this.filterLocalTickets(currentUser.id, filter));
      })
    );
  }

  private filterLocalTickets(reporterId: string, filter?: TicketFilter): Ticket[] {
    let list = this.ticketsSignal().filter((t) => t.reporterId === reporterId);

    if (!filter) return list;

    if (filter.search) {
      const query = filter.search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(query) ||
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.building.toLowerCase().includes(query) ||
          t.room.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    if (filter.status && filter.status !== 'all') {
      list = list.filter((t) => t.status === filter.status);
    }

    if (filter.category && filter.category !== 'all') {
      list = list.filter((t) => t.category.toLowerCase() === filter.category?.toLowerCase());
    }

    if (filter.building && filter.building !== 'all') {
      list = list.filter((t) => t.building.toLowerCase() === filter.building?.toLowerCase());
    }

    if (filter.priority && filter.priority !== 'all') {
      list = list.filter((t) => t.priority === filter.priority);
    }

    if (filter.sortBy === 'created_asc') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (filter.sortBy === 'updated_desc') {
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else {
      // Default: created_desc
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }

  /**
   * Retrieves summary statistics for the reporter's own tickets.
   */
  getTicketStats(): Observable<TicketStats> {
    const currentUser = this.authService.getCurrentUser();

    return this.http.get<TicketStats>(`${environment.apiUrl}/tickets/stats?reporterId=${currentUser.id}`).pipe(
      catchError(() => {
        const userTickets = this.ticketsSignal().filter((t) => t.reporterId === currentUser.id);
        const stats: TicketStats = {
          totalSubmitted: userTickets.length,
          openCount: userTickets.filter((t) => t.status === 'new').length,
          inProgressCount: userTickets.filter((t) => t.status === 'in_progress' || t.status === 'assigned').length,
          resolvedCount: userTickets.filter((t) => t.status === 'resolved').length,
          closedCount: userTickets.filter((t) => t.status === 'closed').length
        };
        return of(stats);
=======
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Ticket,
  TechnicianDashboardStats,
  TicketFilterOptions,
  PaginatedTicketsResponse,
  TicketStatus,
  WorkNoteType,
  TicketResolution,
} from '../models/ticket.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/technician`;

  // Reactive state signals for UI reactivity
  readonly currentStats = signal<TechnicianDashboardStats | null>(null);
  readonly selectedTicket = signal<Ticket | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly lastUpdated = signal<Date>(new Date());

  /**
   * Fetch dashboard KPIs and workload statistics
   */
  getDashboardStats(): Observable<TechnicianDashboardStats> {
    this.isLoading.set(true);
    return this.http.get<TechnicianDashboardStats>(`${this.baseUrl}/dashboard/stats`).pipe(
      tap({
        next: (stats) => {
          this.currentStats.set(stats);
          this.isLoading.set(false);
          this.lastUpdated.set(new Date());
        },
        error: () => this.isLoading.set(false),
>>>>>>> technician
      })
    );
  }

  /**
<<<<<<< HEAD
   * Retrieves a single ticket by ID. Enforces reporter ownership.
   */
  getTicketById(id: string): Observable<Ticket | null> {
    const currentUser = this.authService.getCurrentUser();

    return this.http.get<Ticket>(`${environment.apiUrl}/tickets/${id}`).pipe(
      map((ticket) => {
        // Enforce reporter access restriction
        if (ticket && ticket.reporterId !== currentUser.id) {
          return null;
        }
        return ticket;
      }),
      catchError(() => {
        const match = this.ticketsSignal().find(
          (t) => t.id.toLowerCase() === id.toLowerCase() && t.reporterId === currentUser.id
        );
        return of(match || null);
=======
   * Fetch tickets assigned to the technician with filtering and pagination
   */
  getMyTickets(options: TicketFilterOptions = {}): Observable<PaginatedTicketsResponse> {
    this.isLoading.set(true);
    let params = new HttpParams();

    if (options.search) params = params.set('search', options.search);
    if (options.status && options.status !== 'ALL') params = params.set('status', options.status);
    if (options.priority && options.priority !== 'ALL') params = params.set('priority', options.priority);
    if (options.category && options.category !== 'ALL') params = params.set('category', options.category);
    if (options.building && options.building !== 'ALL') params = params.set('building', options.building);
    if (options.dateRange) params = params.set('dateRange', options.dateRange);
    if (options.page) params = params.set('page', options.page.toString());
    if (options.pageSize) params = params.set('pageSize', options.pageSize.toString());
    if (options.sortBy) params = params.set('sortBy', options.sortBy);
    if (options.sortOrder) params = params.set('sortOrder', options.sortOrder);

    return this.http.get<PaginatedTicketsResponse>(`${this.baseUrl}/tickets`, { params }).pipe(
      tap({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false),
>>>>>>> technician
      })
    );
  }

  /**
<<<<<<< HEAD
   * Submits a new ticket for the current reporter.
   */
  createTicket(dto: CreateTicketDto): Observable<Ticket> {
    const currentUser = this.authService.getCurrentUser();
    const now = new Date().toISOString();
    
    // Generate human-friendly ID like T-1083
    const nextNumber = 1083 + this.ticketsSignal().length;
    const ticketId = `T-${nextNumber}`;

    const initialActivity: TicketActivity = {
      id: `act-${Date.now()}`,
      ticketId,
      status: 'new',
      title: 'Ticket Submitted',
      description: `Issue submitted by ${currentUser.name} via FixMyCampus Reporter Portal.`,
      timestamp: now,
      actorName: currentUser.name,
      actorRole: 'reporter'
    };

    // Process attachments
    const attachments: TicketAttachment[] = (dto.attachments || []).map((att: any, idx) => {
      if (att instanceof File) {
        return {
          id: `att-${Date.now()}-${idx}`,
          name: att.name,
          url: URL.createObjectURL(att),
          sizeBytes: att.size,
          type: att.type,
          uploadedAt: now
        };
      }
      return att;
    });

    const newTicket: Ticket = {
      id: ticketId,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterEmail: currentUser.email,
      title: dto.title.trim(),
      description: dto.description.trim(),
      category: dto.category,
      building: dto.building,
      room: dto.room.trim(),
      priority: dto.priority || 'medium',
      status: 'new',
      attachments,
      comments: [],
      activities: [initialActivity],
      additionalDetails: dto.additionalDetails?.trim(),
      createdAt: now,
      updatedAt: now
    };

    return this.http.post<Ticket>(`${environment.apiUrl}/tickets`, newTicket).pipe(
      tap((backendTicket) => {
        const list = [backendTicket, ...this.ticketsSignal()];
        this.persist(list);
        this.notifyTicketCreation(backendTicket);
      }),
      catchError(() => {
        const list = [newTicket, ...this.ticketsSignal()];
        this.persist(list);
        this.notifyTicketCreation(newTicket);
        return of(newTicket);
=======
   * Fetch single ticket details by ID
   */
  getTicketById(id: string): Observable<Ticket> {
    this.isLoading.set(true);
    return this.http.get<Ticket>(`${this.baseUrl}/tickets/${id}`).pipe(
      tap({
        next: (ticket) => {
          this.selectedTicket.set(ticket);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      })
    );
  }

  /**
   * Update ticket status (e.g. Assigned -> In Progress -> Resolved)
   */
  updateTicketStatus(id: string, newStatus: TicketStatus, note?: string): Observable<Ticket> {
    this.isLoading.set(true);
    const body = {
      status: newStatus,
      note,
      authorName: this.auth.getTechnicianName(),
    };

    return this.http.patch<Ticket>(`${this.baseUrl}/tickets/${id}/status`, body).pipe(
      tap({
        next: (updatedTicket) => {
          this.selectedTicket.set(updatedTicket);
          this.isLoading.set(false);
          this.lastUpdated.set(new Date());
        },
        error: () => this.isLoading.set(false),
>>>>>>> technician
      })
    );
  }

<<<<<<< HEAD
  private notifyTicketCreation(ticket: Ticket): void {
    this.notifService.addNotification({
      userId: ticket.reporterId,
      title: 'Ticket Submitted Successfully',
      message: `Your issue #${ticket.id} (${ticket.title}) was received and queued for facility triage.`,
      type: 'ticket_created',
      ticketId: ticket.id,
      read: false
    });
  }

  /**
   * Adds a communication comment to a ticket.
   */
  addComment(ticketId: string, content: string): Observable<TicketComment> {
    const currentUser = this.authService.getCurrentUser();
    const now = new Date().toISOString();
    const newComment: TicketComment = {
      id: `c-${Date.now()}`,
      ticketId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: 'reporter',
      content: content.trim(),
      createdAt: now
    };

    return this.http.post<TicketComment>(`${environment.apiUrl}/tickets/${ticketId}/comments`, newComment).pipe(
      tap((savedComment) => {
        this.applyLocalComment(ticketId, savedComment);
      }),
      catchError(() => {
        this.applyLocalComment(ticketId, newComment);
        return of(newComment);
=======
  /**
   * Add a technician work note / comment
   */
  addWorkNote(id: string, content: string, noteType: WorkNoteType = 'GENERAL'): Observable<Ticket> {
    this.isLoading.set(true);
    const body = {
      content,
      noteType,
      authorName: this.auth.getTechnicianName(),
    };

    return this.http.post<Ticket>(`${this.baseUrl}/tickets/${id}/notes`, body).pipe(
      tap({
        next: (updatedTicket) => {
          this.selectedTicket.set(updatedTicket);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
>>>>>>> technician
      })
    );
  }

<<<<<<< HEAD
  private applyLocalComment(ticketId: string, comment: TicketComment): void {
    const now = new Date().toISOString();
    const updated = this.ticketsSignal().map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          comments: [...ticket.comments, comment],
          updatedAt: now
        };
      }
      return ticket;
    });
    this.persist(updated);
  }

  /**
   * Helper to get recent tickets for dashboard
   */
  getRecentTickets(limit = 5): Observable<Ticket[]> {
    return this.getMyTickets().pipe(
      map((tickets) => tickets.slice(0, limit))
=======
  /**
   * Complete work and submit resolution details
   */
  resolveTicket(
    id: string,
    resolution: Omit<TicketResolution, 'resolvedAt' | 'resolvedBy'>
  ): Observable<Ticket> {
    this.isLoading.set(true);
    const body = {
      resolution,
      authorName: this.auth.getTechnicianName(),
    };

    return this.http.post<Ticket>(`${this.baseUrl}/tickets/${id}/resolve`, body).pipe(
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

  /**
   * Upload an evidence attachment (image or documentation)
   */
  uploadAttachment(
    id: string,
    fileData: { fileName: string; fileUrl: string; fileSize: string; fileType: string; isEvidence?: boolean }
  ): Observable<Ticket> {
    this.isLoading.set(true);
    const body = {
      ...fileData,
      authorName: this.auth.getTechnicianName(),
      uploadedBy: this.auth.getTechnicianName(),
    };

    return this.http.post<Ticket>(`${this.baseUrl}/tickets/${id}/attachments`, body).pipe(
      tap({
        next: (updatedTicket) => {
          this.selectedTicket.set(updatedTicket);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      })
>>>>>>> technician
    );
  }
}
