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
  DuplicateCheckRequest,
  DuplicateCheckResponse,
  DuplicateTicketMatch,
  TicketFilter,
  TicketComment,
  TicketImage,
  ImageCategory,
  TicketAttachment
} from '../models/ticket.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  
  private readonly baseUrl = `${environment.apiUrl}/Tickets`;
  private readonly techUrl = `${environment.apiUrl}/Technician`;
  private readonly adminUrl = `${environment.apiUrl}/Admin`;

  private mapBackendStatus(status: string): TicketStatus {
    const s = (status || '').toLowerCase();
    if (s === 'new') return 'NEW';
    if (s === 'assigned') return 'ASSIGNED';
    if (s === 'inprogress' || s === 'in progress') return 'IN_PROGRESS';
    if (s === 'resolved') return 'RESOLVED';
    if (s === 'closed') return 'CLOSED';
    return 'NEW';
  }

  private mapBackendPriority(priority: any): any {
    if (typeof priority === 'string') {
      return priority.toUpperCase() || 'MEDIUM';
    }
    switch (priority) {
      case 0: return 'LOW';
      case 1: return 'MEDIUM';
      case 2: return 'HIGH';
      case 3: return 'CRITICAL';
      default: return 'MEDIUM';
    }
  }

  private mapToTicket(dto: any): Ticket {
    const rawImages = dto.images || [];
    const images: TicketImage[] = rawImages.map((img: any) => ({
      id: img.id,
      ticketId: img.ticketId || dto.id,
      category: (img.category === 2 || img.category === 'ResolutionEvidence') ? 'ResolutionEvidence' : 'ReportedIssue',
      url: img.url
        ? (img.url.startsWith('http') ? img.url : `${environment.apiUrl.replace(/\/api\/?$/, '')}${img.url}`)
        : `${environment.apiUrl}/Tickets/${img.ticketId || dto.id}/images/${img.id}/file`,
      fileName: img.fileName,
      contentType: img.contentType,
      fileSize: img.fileSize,
      uploaderId: img.uploaderId,
      uploaderName: img.uploaderName || '',
      uploadedAt: img.uploadedAt
    }));

    const attachments: TicketAttachment[] = images.map(img => ({
      id: img.id,
      ticketId: img.ticketId,
      category: img.category,
      fileName: img.fileName,
      fileUrl: img.url,
      fileType: img.contentType,
      fileSize: img.fileSize,
      uploadedAt: img.uploadedAt,
      uploaderName: img.uploaderName
    }));

    return {
      id: dto.id,
      ticketNumber: dto.id.toString(),
      reporterId: dto.reporter?.id,
      reporterName: dto.reporter?.firstName ? `${dto.reporter.firstName} ${dto.reporter.lastName}` : (dto.reporter?.email || 'Unknown'),
      reporterEmail: dto.reporter?.email,
      title: dto.title || dto.Title || dto.description?.substring(0, 50) || `${dto.category} Issue`,
      description: dto.description,
      category: dto.category,
      building: dto.building || dto.Building,
      floor: dto.floor || dto.Floor || undefined,
      room: dto.room || dto.Room || undefined,
      priority: this.mapBackendPriority(dto.priority),
      status: this.mapBackendStatus(dto.status),
      assignedTechnicianId: dto.assignedTechnician?.id,
      assignedTechnicianName: dto.assignedTechnician?.fullName,
      assignedTechnician: dto.assignedTechnician ? {
        id: dto.assignedTechnician.id,
        name: dto.assignedTechnician.fullName
      } : undefined,
      images,
      attachments,
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

  private mapStatusToInt(status: TicketStatus | string): number {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'NEW': return 0;
      case 'ASSIGNED': return 1;
      case 'IN_PROGRESS': return 2;
      case 'RESOLVED': return 3;
      case 'CLOSED': return 4;
      default: return 0;
    }
  }

  updateStatus(id: string, newStatus: TicketStatus, note?: string): Observable<Ticket> {
    const role = this.authService.getUserRole();

    // If technician lifecycle endpoints are appropriate:
    if (role === 'TECHNICIAN' && newStatus === 'IN_PROGRESS') {
      return this.http.put<any>(`${this.techUrl}/tickets/${id}/start`, {}).pipe(
        switchMap(() => this.getTicketById(id))
      );
    }
    if (role === 'TECHNICIAN' && newStatus === 'RESOLVED') {
      return this.http.put<any>(`${this.techUrl}/tickets/${id}/resolve`, { resolutionNote: note }).pipe(
        switchMap(() => this.getTicketById(id))
      );
    }

    // For Admin (e.g. CLOSED or any lifecycle status) or fallback:
    const payload = {
      status: this.mapStatusToInt(newStatus),
      note: note || undefined
    };

    return this.http.put<any>(`${this.baseUrl}/${id}/status`, payload).pipe(
      switchMap(() => this.getTicketById(id))
    );
  }

  updateTicketStatus(id: string, newStatus: TicketStatus, note?: string): Observable<Ticket> {
    return this.updateStatus(id, newStatus, note);
  }
  
  updatePriority(id: string, priority: string): Observable<Ticket> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/priority`, { priority: this.mapPriorityToInt(priority) }).pipe(
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

  private mapPriorityToInt(priority: string): number {
    switch (priority) {
      case 'LOW': return 0;
      case 'MEDIUM': return 1;
      case 'HIGH': return 2;
      case 'CRITICAL': return 3;
      default: return 1; // Default to MEDIUM
    }
  }

  checkDuplicate(dto: DuplicateCheckRequest): Observable<DuplicateCheckResponse> {
    return this.http.post<DuplicateCheckResponse>(`${this.baseUrl}/check-duplicate`, dto);
  }

  createTicket(dto: CreateTicketDto): Observable<Ticket> {
    if (dto.attachments && dto.attachments.length > 0) {
      const formData = new FormData();
      formData.append('title', dto.title);
      formData.append('category', dto.category);
      formData.append('building', dto.building);
      if (dto.floor) formData.append('floor', dto.floor);
      if (dto.room) formData.append('room', dto.room);
      formData.append('priority', dto.priority);
      formData.append('description', dto.description);
      if (dto.ignorePotentialDuplicates !== undefined) {
        formData.append('ignorePotentialDuplicates', String(dto.ignorePotentialDuplicates));
      }

      for (const file of dto.attachments) {
        formData.append('files', file, file.name);
      }

      return this.http.post<any>(`${this.baseUrl}`, formData).pipe(
        map(t => this.mapToTicket(t))
      );
    }

    const payload = {
      title: dto.title,
      category: dto.category,
      building: dto.building,
      floor: dto.floor,
      room: dto.room,
      priority: this.mapPriorityToInt(dto.priority),
      description: dto.description,
      ignorePotentialDuplicates: dto.ignorePotentialDuplicates ?? false
    };

    return this.http.post<any>(`${this.baseUrl}`, payload).pipe(
      map(t => this.mapToTicket(t))
    );
  }

  uploadResolutionImages(ticketId: string, files: File[]): Observable<TicketImage[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file, file.name);
    }
    return this.http.post<TicketImage[]>(`${this.techUrl}/tickets/${ticketId}/images`, formData);
  }

  uploadTicketImages(ticketId: string, files: File[]): Observable<TicketImage[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file, file.name);
    }
    return this.http.post<TicketImage[]>(`${this.baseUrl}/${ticketId}/images`, formData);
  }

  addComment(ticketId: string, content: string): Observable<TicketComment> {
    return this.http.post<TicketComment>(`${this.baseUrl}/${ticketId}/comments`, { content });
  }
}
