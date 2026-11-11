import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { TicketDetailComponent } from './ticket-detail.component';
import { NotificationStore } from '../../../../store/notification.store';
import { TechnicianStore } from '../../../../store/technician.store';
import { environment } from '../../../../../environments/environment';

describe('Admin TicketDetailComponent (Internal Notes)', () => {
  let component: TicketDetailComponent;
  let fixture: ComponentFixture<TicketDetailComponent>;
  let httpTesting: HttpTestingController;
  let notificationStoreSpy: { showToast: ReturnType<typeof vi.fn> };

  const ticketId = 't-100';

  const baseTicketDto = {
    id: ticketId,
    title: 'Steam valve leak',
    description: 'Water dripping in basement mechanical room',
    category: 'Plumbing',
    building: 'Science Hall',
    floor: 'B1',
    room: '02',
    priority: 'High',
    status: 'Assigned',
    reporter: {
      id: 'rep-1',
      fullName: 'Alice Reporter',
      email: 'alice@campus.edu'
    },
    createdAt: '2026-11-10T08:00:00Z',
    updatedAt: '2026-11-10T09:00:00Z',
    internalNotes: [] as string[],
    comments: [],
    images: []
  };

  const baseHistoryDto = [
    {
      id: 'hist-1',
      ticketId,
      oldStatus: null,
      newStatus: 'New',
      changedAt: '2026-11-10T08:00:00Z',
      note: 'Initial submission',
      changedBy: { id: 'rep-1', fullName: 'Alice Reporter', email: 'alice@campus.edu' }
    }
  ];

  beforeEach(async () => {
    notificationStoreSpy = {
      showToast: vi.fn()
    };

    const technicianStoreMock = {
      technicians: signal([]),
      loadTechnicians: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TicketDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NotificationStore, useValue: notificationStoreSpy },
        { provide: TechnicianStore, useValue: technicianStoreMock },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: ticketId }))
          }
        }
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TicketDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Flush initial ticket + history load
    httpTesting.expectOne(`${environment.apiUrl}/Tickets/${ticketId}`).flush(baseTicketDto);
    httpTesting.expectOne(`${environment.apiUrl}/Tickets/${ticketId}/history`).flush(baseHistoryDto);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should post to internal-notes endpoint (not comments), preserve activityLog, and render multiple identical notes safely', () => {
    expect(component.ticket()?.activityLog?.length).toBe(1);

    component.newNoteText = '  Check shutoff valve #4  ';
    component.addNote();

    // Should track submitting state without blanking the whole view via isLoading
    expect(component.submittingNote()).toBe(true);
    expect(component.isLoading()).toBe(false);
    // Should not clear input or toast before HTTP response completes
    expect(component.newNoteText).toBe('  Check shutoff valve #4  ');
    expect(notificationStoreSpy.showToast).not.toHaveBeenCalled();

    // Must hit /internal-notes rather than /comments
    httpTesting.expectNone(`${environment.apiUrl}/Tickets/${ticketId}/comments`);
    const req1 = httpTesting.expectOne(`${environment.apiUrl}/Tickets/${ticketId}/internal-notes`);
    expect(req1.request.method).toBe('POST');
    expect(req1.request.body).toEqual({ note: 'Check shutoff valve #4' });

    const note1 = '2026-11-11 14:30 UTC (Admin): Check shutoff valve #4';
    req1.flush({
      ...baseTicketDto,
      internalNotes: [note1],
      updatedAt: '2026-11-11T14:30:00Z'
    });
    fixture.detectChanges();

    expect(component.submittingNote()).toBe(false);
    expect(component.newNoteText).toBe('');
    expect(component.ticket()?.internalNotes).toEqual([note1]);
    expect(component.ticket()?.activityLog?.length).toBe(1);
    expect(notificationStoreSpy.showToast).toHaveBeenCalledWith({
      type: 'success',
      message: 'Internal Note Added'
    });

    // Submit an identical formatted note string to verify @for track $index renders both without NG0955
    component.newNoteText = 'Check shutoff valve #4';
    component.addNote();

    const req2 = httpTesting.expectOne(`${environment.apiUrl}/Tickets/${ticketId}/internal-notes`);
    req2.flush({
      ...baseTicketDto,
      internalNotes: [note1, note1],
      updatedAt: '2026-11-11T14:30:30Z'
    });
    fixture.detectChanges();

    const renderedNotes = fixture.nativeElement.querySelectorAll('.bg-amber-50\\/60 p');
    expect(renderedNotes.length).toBe(2);
    expect(renderedNotes[0].textContent.trim()).toBe(note1);
    expect(renderedNotes[1].textContent.trim()).toBe(note1);
  });

  it('should preserve composer text and show error feedback when adding internal note fails', () => {
    component.newNoteText = 'Parts ETA next Monday';
    component.addNote();

    const req = httpTesting.expectOne(`${environment.apiUrl}/Tickets/${ticketId}/internal-notes`);
    req.flush(
      { message: 'Only admins can add internal notes.' },
      { status: 403, statusText: 'Forbidden' }
    );
    fixture.detectChanges();

    expect(component.submittingNote()).toBe(false);
    expect(component.newNoteText).toBe('Parts ETA next Monday');
    expect(component.noteError()).toBe('Only admins can add internal notes.');
    expect(component.ticket()?.internalNotes).toEqual([]);
    expect(notificationStoreSpy.showToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Only admins can add internal notes.'
    });
    expect(notificationStoreSpy.showToast).not.toHaveBeenCalledWith({
      type: 'success',
      message: 'Internal Note Added'
    });
  });
});

