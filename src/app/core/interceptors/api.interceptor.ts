import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpResponse,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { catchError, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MockTicketStore } from '../services/mock-ticket-store';
import {
  TicketFilterOptions,
  TicketStatus,
  WorkNoteType,
  TicketResolution,
} from '../models/ticket.model';

export const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // 1. Attach authorization headers
  const token = localStorage.getItem('fmc_auth_token') || 'tech-session-token-101';
  let authReq = req;
  if (!req.headers.has('Authorization')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
  }

  // If mock fallback is enabled or backend is unreachable, we intercept technician API calls
  if (authReq.url.includes('/api/technician')) {
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // If backend connection fails (status 0 or 404/500 and fallback is enabled), handle via mock store
        if (environment.useMockFallback && (error.status === 0 || error.status === 404)) {
          return handleMockTechnicianRoute(authReq);
        }
        return throwError(() => error);
      })
    );
  }

  return next(authReq);
};

function handleMockTechnicianRoute(req: HttpRequest<unknown>) {
  const url = req.url;

  // GET /api/technician/dashboard/stats
  if (url.endsWith('/dashboard/stats') && req.method === 'GET') {
    const stats = MockTicketStore.getDashboardStats();
    return of(new HttpResponse({ status: 200, body: stats })).pipe(delay(120));
  }

  // GET /api/technician/tickets/:id
  const singleTicketMatch = url.match(/\/api\/technician\/tickets\/([A-Za-z0-9-]+)$/);
  if (singleTicketMatch && req.method === 'GET') {
    const id = singleTicketMatch[1];
    const ticket = MockTicketStore.getTicketById(id);
    if (!ticket) {
      return throwError(
        () => new HttpErrorResponse({ status: 404, statusText: `Ticket ${id} not found.` })
      );
    }
    return of(new HttpResponse({ status: 200, body: ticket })).pipe(delay(150));
  }

  // PATCH /api/technician/tickets/:id/status
  const statusMatch = url.match(/\/api\/technician\/tickets\/([A-Za-z0-9-]+)\/status$/);
  if (statusMatch && req.method === 'PATCH') {
    const id = statusMatch[1];
    const body = req.body as { status: TicketStatus; note?: string; authorName?: string };
    try {
      const updated = MockTicketStore.updateTicketStatus(
        id,
        body.status,
        body.authorName || 'Dave Miller',
        body.note
      );
      return of(new HttpResponse({ status: 200, body: updated })).pipe(delay(200));
    } catch (err: any) {
      return throwError(() => new HttpErrorResponse({ status: 400, statusText: err.message }));
    }
  }

  // POST /api/technician/tickets/:id/notes
  const notesMatch = url.match(/\/api\/technician\/tickets\/([A-Za-z0-9-]+)\/notes$/);
  if (notesMatch && req.method === 'POST') {
    const id = notesMatch[1];
    const body = req.body as { content: string; noteType?: WorkNoteType; authorName?: string };
    try {
      const updated = MockTicketStore.addWorkNote(
        id,
        body.content,
        body.noteType || 'GENERAL',
        body.authorName || 'Dave Miller'
      );
      return of(new HttpResponse({ status: 201, body: updated })).pipe(delay(200));
    } catch (err: any) {
      return throwError(() => new HttpErrorResponse({ status: 400, statusText: err.message }));
    }
  }

  // POST /api/technician/tickets/:id/resolve
  const resolveMatch = url.match(/\/api\/technician\/tickets\/([A-Za-z0-9-]+)\/resolve$/);
  if (resolveMatch && req.method === 'POST') {
    const id = resolveMatch[1];
    const body = req.body as {
      resolution: Omit<TicketResolution, 'resolvedAt' | 'resolvedBy'>;
      authorName?: string;
    };
    try {
      const updated = MockTicketStore.resolveTicket(
        id,
        body.resolution,
        body.authorName || 'Dave Miller'
      );
      return of(new HttpResponse({ status: 200, body: updated })).pipe(delay(250));
    } catch (err: any) {
      return throwError(() => new HttpErrorResponse({ status: 400, statusText: err.message }));
    }
  }

  // POST /api/technician/tickets/:id/attachments
  const attachMatch = url.match(/\/api\/technician\/tickets\/([A-Za-z0-9-]+)\/attachments$/);
  if (attachMatch && req.method === 'POST') {
    const id = attachMatch[1];
    const body = req.body as any;
    try {
      const updated = MockTicketStore.addAttachment(
        id,
        {
          fileName: body.fileName || 'evidence_photo.jpg',
          fileUrl: body.fileUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
          fileSize: body.fileSize || '2.4 MB',
          fileType: body.fileType || 'image/jpeg',
          uploadedBy: body.uploadedBy || 'Dave Miller',
          isEvidence: body.isEvidence ?? true,
        },
        body.authorName || 'Dave Miller'
      );
      return of(new HttpResponse({ status: 201, body: updated })).pipe(delay(300));
    } catch (err: any) {
      return throwError(() => new HttpErrorResponse({ status: 400, statusText: err.message }));
    }
  }

  // GET /api/technician/tickets (with filters and pagination)
  if (url.includes('/api/technician/tickets') && req.method === 'GET') {
    const params = req.params;
    const filterOptions: TicketFilterOptions = {
      search: params.get('search') || undefined,
      status: params.get('status') || undefined,
      priority: params.get('priority') || undefined,
      category: params.get('category') || undefined,
      building: params.get('building') || undefined,
      dateRange: params.get('dateRange') || undefined,
      page: params.get('page') ? parseInt(params.get('page')!, 10) : 1,
      pageSize: params.get('pageSize') ? parseInt(params.get('pageSize')!, 10) : 10,
      sortBy: (params.get('sortBy') as any) || 'updatedAt',
      sortOrder: (params.get('sortOrder') as any) || 'desc',
    };

    const result = MockTicketStore.filterTickets(filterOptions);
    return of(new HttpResponse({ status: 200, body: result })).pipe(delay(150));
  }

  return throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Route Not Found' }));
}
