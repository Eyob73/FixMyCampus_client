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
