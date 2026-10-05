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
      })
    );
  }

  /**
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
      })
    );
  }

  /**
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
      })
    );
  }

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
      })
    );
  }

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
    );
  }
}
