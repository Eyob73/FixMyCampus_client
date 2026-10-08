import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MyTicketsComponent } from './my-tickets.component';
import { TicketService } from '../../../services/ticket.service';

describe('MyTicketsComponent', () => {
  let fixture: ComponentFixture<MyTicketsComponent>;
  let component: MyTicketsComponent;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [MyTicketsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        TicketService,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ search: '', status: 'all' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load tickets on init', async () => {
    await fixture.whenStable();
    expect(component.tickets().length).toBeGreaterThan(0);
    expect(component.paginatedTickets().length).toBeGreaterThan(0);
  });

  it('should filter by query string', async () => {
    await fixture.whenStable();
    component.searchQuery.set('Projector');
    component.onFilterChange();
    fixture.detectChanges();

    for (const t of component.filteredTickets()) {
      const match =
        t.title.includes('Projector') ||
        t.id.includes('Projector') ||
        t.description.includes('Projector');
      expect(match).toBe(true);
    }
  });

  it('should clear all filters', async () => {
    await fixture.whenStable();
    component.searchQuery.set('NonExistentTerm');
    component.statusFilter.set('resolved');
    expect(component.isFilterActive()).toBe(true);

    component.clearFilters();
    expect(component.isFilterActive()).toBe(false);
    expect(component.searchQuery()).toBe('');
    expect(component.statusFilter()).toBe('all');
  });
});
