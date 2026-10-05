import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ReportIssueComponent } from './report-issue.component';
import { TicketService } from '../../services/ticket.service';

describe('ReportIssueComponent', () => {
  let fixture: ComponentFixture<ReportIssueComponent>;
  let component: ReportIssueComponent;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ReportIssueComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        TicketService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create form with invalid initial state', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should validate required fields', () => {
    component.form.patchValue({
      title: 'Water Leak in Restroom',
      category: 'Plumbing',
      building: 'Student Union',
      room: '2nd Floor Restroom',
      priority: 'urgent',
      description: 'Continuous water spraying from cold water pipe under sink basin.'
    });

    expect(component.form.valid).toBe(true);
  });

  it('should prevent submission when invalid', () => {
    component.onSubmit();
    expect(component.submitting()).toBe(false);
    expect(component.submitError()).toContain('Please fill out all required fields');
  });
});
