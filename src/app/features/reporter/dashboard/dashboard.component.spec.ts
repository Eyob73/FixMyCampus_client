import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { TicketService } from '../../../services/ticket.service';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        TicketService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and load ticket metrics', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.stats().totalSubmitted).toBeGreaterThan(0);
    expect(component.allRecentTickets().length).toBeGreaterThan(0);
  });

  it('should filter recent tickets by status', async () => {
    await fixture.whenStable();
    component.onStatusChange('resolved');
    fixture.detectChanges();

    for (const t of component.filteredTickets()) {
      expect(t.status).toBe('resolved');
    }
  });
});
