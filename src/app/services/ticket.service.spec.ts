import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TicketService } from './ticket.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

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
    const mockStats: any = {
      assignedTickets: 7,
      openTickets: 3,
      inProgressTickets: 2,
      resolvedTickets: 1,
      closedTickets: 1,
    };

    service.getDashboardStats().subscribe((stats) => {
      expect(stats.assignedTickets).toBe(7);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/Technician/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('should send FormData when creating ticket with attachments', () => {
    const fakeFile = new File(['fake-image-bytes'], 'test-leak.png', { type: 'image/png' });
    const dto: any = {
      title: 'Broken window',
      description: 'Glass cracked in lecture hall',
      category: 'STRUCTURAL',
      building: 'Engineering Hall',
      priority: 'MEDIUM',
      attachments: [fakeFile],
    };

    service.createTicket(dto).subscribe((ticket) => {
      expect(ticket.id).toBe('101');
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/Tickets`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).has('title')).toBe(true);
    expect((req.request.body as FormData).has('files')).toBe(true);
    req.flush({
      id: '101',
      title: 'Broken window',
      description: 'Glass cracked',
      category: 'STRUCTURAL',
      status: 'NEW',
      priority: 'MEDIUM',
      building: 'Engineering Hall',
      createdAt: '2026-10-28T10:00:00Z',
    });
  });

  it('should upload resolution images with multipart FormData to technician endpoint', () => {
    const fakeEvidence = new File(['evidence-bytes'], 'fixed.jpg', { type: 'image/jpeg' });

    service.uploadResolutionImages('ticket-77', [fakeEvidence]).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/Technician/tickets/ticket-77/images`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush([{ id: 'img-1' }]);
  });

  it('should map returned images with category and download URLs', () => {
    service.getTicketById('ticket-55').subscribe((ticket) => {
      expect(ticket.images?.length).toBe(2);
      expect(ticket.attachments?.length).toBe(2);
      expect(ticket.images?.[0].category).toBe('ReportedIssue');
      expect(ticket.images?.[1].category).toBe('ResolutionEvidence');
      expect(ticket.attachments?.[0].fileUrl).toContain('/api/Tickets/ticket-55/images/img-1/file');
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/Tickets/ticket-55`);
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 'ticket-55',
      title: 'Pipe Leak',
      description: 'Water under sink',
      category: 'PLUMBING',
      status: 'RESOLVED',
      priority: 'HIGH',
      building: 'Main Hall',
      createdAt: '2026-10-28T09:00:00Z',
      images: [
        {
          id: 'img-1',
          ticketId: 'ticket-55',
          category: 1, // ReportedIssue
          storagePath: 'uploads/img-1.png',
          originalFileName: 'leak.png',
          contentType: 'image/png',
          fileSize: 1024,
          uploaderId: 'user-1',
          uploaderName: 'Alice Reporter',
          uploadedAt: '2026-10-28T09:00:00Z',
        },
        {
          id: 'img-2',
          ticketId: 'ticket-55',
          category: 2, // ResolutionEvidence
          storagePath: 'uploads/img-2.jpg',
          originalFileName: 'repaired.jpg',
          contentType: 'image/jpeg',
          fileSize: 2048,
          uploaderId: 'tech-1',
          uploaderName: 'Bob Technician',
          uploadedAt: '2026-10-28T11:00:00Z',
        },
      ],
    });

    const reqHistory = httpTesting.expectOne(`${environment.apiUrl}/Tickets/ticket-55/history`);
    expect(reqHistory.request.method).toBe('GET');
    reqHistory.flush([]);
  });

  it('should call check-duplicate endpoint with payload', () => {
    const checkDto = {
      title: 'Classroom projector broken',
      description: 'Projector stopped working',
      category: 'IT_SECURITY',
      building: 'Science Hall',
      room: '101'
    };

    service.checkDuplicate(checkDto).subscribe((res) => {
      expect(res.isDuplicate).toBe(true);
      expect(res.primaryMatch?.title).toBe('Classroom projector broken');
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/Tickets/check-duplicate`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe(checkDto.title);
    req.flush({
      isDuplicate: true,
      hasPotentialDuplicates: false,
      primaryMatch: {
        ticketId: 't-1',
        ticketNumber: 'T-001',
        title: 'Classroom projector broken',
        description: 'Projector stopped working',
        status: 'NEW',
        matchLevel: 'Confirmed'
      },
      matches: []
    });
  });
});

