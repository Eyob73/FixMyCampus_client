import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TicketDetailComponent } from './ticket-detail.component';
import { AuthService } from '../../../services/auth.service';
import { NotificationStore } from '../../../store/notification.store';
import { environment } from '../../../../environments/environment';

describe('Technician TicketDetailComponent (Internal Notes)', () => {
  let component: TicketDetailComponent;
  let fixture: ComponentFixture<TicketDetailComponent>;
  let httpTesting: HttpTestingController;

  const ticketId = 'tech-ticket-1';

  const baseTicketDto = {
    id: ticketId,
    title: 'Chiller pump vibration',
    description: 'Excessive noise on basement level',
    category: 'HVAC',
    building: 'Science Hall',
    floor: 'B1',
    room: 'Mech 01',
    priority: 'High',
    status: 'Assigned',
    reporter: {
      id: 'rep-1',
      fullName: 'Alice Reporter',
      email: 'alice@campus.edu'
    },
    assignedTechnician: {
      id: 'tech-1',
      fullName: 'Sam Technician',
      email: 'tech@campus.edu'
    },
    createdAt: '2026-11-10T08:00:00Z',
    updatedAt: '2026-11-11T10:00:00Z',
    internalNotes: [
      '2026-11-11 09:15 UTC (Facilities Admin): Keybox PIN is 4829#.',
      '2026-11-11 09:45 UTC (Facilities Admin): Spare bearings stored in Bay 3.'
    ],
    comments: [],
    images: []
  };

  beforeEach(async () => {
    const authServiceMock = {
      currentUser: signal({ id: 'tech-1', name: 'Sam Technician', email: 'tech@campus.edu', role: 'TECHNICIAN', department: 'HVAC' }),
      getUserRole: vi.fn().mockReturnValue('TECHNICIAN')
    };

    const notificationStoreMock = {
      showToast: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TicketDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationStore, useValue: notificationStoreMock },
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
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const flushTicketFetch = (dto: typeof baseTicketDto) => {
    fixture.detectChanges();

    // First fetch from component's direct getTicketById call
    httpTesting.expectOne(`${environment.apiUrl}/Tickets/${ticketId}`).flush(dto);
    httpTesting.expectOne(`${environment.apiUrl}/Tickets/${ticketId}/history`).flush([]);

    // Second fetch triggered by ticketStore.loadTicketById(id)
    httpTesting.expectOne(`${environment.apiUrl}/Tickets/${ticketId}`).flush(dto);
    httpTesting.expectOne(`${environment.apiUrl}/Tickets/${ticketId}/history`).flush([]);

    fixture.detectChanges();
  };

  it('should render internal operations notes returned from backend as read-only for the assigned technician', () => {
    flushTicketFetch(baseTicketDto);

    const card = fixture.nativeElement.querySelector('[data-testid="technician-internal-notes"]');
    expect(card).toBeTruthy();

    const notes = card.querySelectorAll('p.leading-relaxed');
    expect(notes.length).toBe(2);
    expect(notes[0].textContent.trim()).toBe('2026-11-11 09:15 UTC (Facilities Admin): Keybox PIN is 4829#.');
    expect(notes[1].textContent.trim()).toBe('2026-11-11 09:45 UTC (Facilities Admin): Spare bearings stored in Bay 3.');

    // Read-only for technician: should not contain an add internal note button or composer inside this card
    expect(card.querySelector('textarea')).toBeNull();
    expect(card.querySelector('button')).toBeNull();
  });

  it('should display empty state when no internal operations notes exist', () => {
    flushTicketFetch({
      ...baseTicketDto,
      internalNotes: []
    });

    const card = fixture.nativeElement.querySelector('[data-testid="technician-internal-notes"]');
    expect(card).toBeTruthy();
    expect(card.textContent).toContain('No internal operations notes added by administrators yet.');
  });
});

