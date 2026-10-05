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
  });
});
