import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TicketService } from './ticket.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('TicketService', () => {
  let service: TicketService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TicketService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(TicketService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TicketService } from './ticket.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

describe('TicketService', () => {
  let service: TicketService;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        TicketService,
        AuthService,
        NotificationService
      ]
    });
    service = TestBed.inject(TicketService);
    authService = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request dashboard stats from backend API', () => {
    const mockStats = {
      totalAssigned: 7,
      newAssigned: 3,
      inProgress: 2,
      resolved: 1,
      closed: 1,
      highPriority: 3,
      avgResolutionHours: 4.2,
      slaComplianceRate: 94,
      priorityCounts: { critical: 1, high: 2, medium: 2, low: 2 },
      statusCounts: { assigned: 3, inProgress: 2, resolved: 1, closed: 1 },
    };

    service.getDashboardStats().subscribe((stats) => {
      expect(stats.totalAssigned).toBe(7);
      expect(stats.highPriority).toBe(3);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/technician/dashboard/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('should update ticket status via PATCH', () => {
    const mockUpdatedTicket: any = {
      id: 'T-1082',
      status: 'IN_PROGRESS',
    };

    service.updateTicketStatus('T-1082', 'IN_PROGRESS', 'Arrived on site').subscribe((ticket) => {
      expect(ticket.status).toBe('IN_PROGRESS');
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/technician/tickets/T-1082/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.status).toBe('IN_PROGRESS');
    req.flush(mockUpdatedTicket);
  it('should retrieve tickets for authenticated reporter only', async () => {
    const tickets = await firstValueFrom(service.getMyTickets());
    expect(tickets.length).toBeGreaterThan(0);
    const currentUser = authService.getCurrentUser();
    for (const t of tickets) {
      expect(t.reporterId).toBe(currentUser.id);
    }
  });

  it('should calculate ticket statistics accurately', async () => {
    const stats = await firstValueFrom(service.getTicketStats());
    expect(stats.totalSubmitted).toBeGreaterThan(0);
    expect(stats.openCount + stats.inProgressCount + stats.resolvedCount + stats.closedCount)
      .toBe(stats.totalSubmitted);
  });

  it('should create a new ticket with status "new"', async () => {
    const newTicket = await firstValueFrom(
      service.createTicket({
        title: 'Broken Radiator Valve',
        category: 'HVAC / Climate',
        building: 'Science Building',
        room: 'Room 101',
        priority: 'high',
        description: 'Radiator valve is leaking steam onto the carpet.'
      })
    );

    expect(newTicket.id).toBeDefined();
    expect(newTicket.title).toBe('Broken Radiator Valve');
    expect(newTicket.status).toBe('new');
    expect(newTicket.reporterId).toBe(authService.getCurrentUser().id);
    expect(newTicket.activities.length).toBe(1);
  });

  it('should add comment and update ticket thread', async () => {
    const tickets = await firstValueFrom(service.getMyTickets());
    const ticket = tickets[0];
    const initialCommentCount = ticket.comments.length;

    const comment = await firstValueFrom(
      service.addComment(ticket.id, 'Here is additional information.')
    );
    expect(comment.content).toBe('Here is additional information.');
    expect(comment.authorId).toBe(authService.getCurrentUser().id);

    const updated = await firstValueFrom(service.getTicketById(ticket.id));
    expect(updated?.comments.length).toBe(initialCommentCount + 1);
  });
});
