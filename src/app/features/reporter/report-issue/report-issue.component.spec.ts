import { describe, it, expect, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ReportIssueComponent } from './report-issue.component';
import { TicketService } from '../../../services/ticket.service';

describe('ReportIssueComponent', () => {
  let fixture: ComponentFixture<ReportIssueComponent>;
  let component: ReportIssueComponent;

  beforeEach(async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
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
      floor: '2nd Floor',
      room: 'Restroom',
      priority: 'HIGH',
      description: 'Continuous water spraying from cold water pipe under sink basin.'
    });

    expect(component.form.valid).toBe(true);
  });

  it('should prevent submission when invalid', () => {
    component.onSubmit();
    expect(component.submitting()).toBe(false);
    expect(component.submitError()).toContain('Please fill out all required fields');
  });

  it('should accept valid image files and generate previews', () => {
    const validImg = new File(['valid-image-content'], 'door.png', { type: 'image/png' });
    component.addFiles([validImg]);

    expect(component.selectedFiles().length).toBe(1);
    expect(component.selectedFiles()[0].name).toBe('door.png');
    expect(component.fileError()).toBeNull();
  });

  it('should reject files exceeding 10 MB limit', () => {
    const largeFile = new File([''], 'huge.jpg', { type: 'image/jpeg' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    component.addFiles([largeFile]);
    expect(component.selectedFiles().length).toBe(0);
    expect(component.fileError()).toContain('exceeds the maximum allowed file size of 10 MB');
  });

  it('should reject unsupported file formats', () => {
    const scriptFile = new File(['evil'], 'script.exe', { type: 'application/x-msdownload' });
    component.addFiles([scriptFile]);

    expect(component.selectedFiles().length).toBe(0);
    expect(component.fileError()).toContain('unsupported format');
  });

  it('should allow removing a selected file', () => {
    const img1 = new File(['bytes1'], 'img1.png', { type: 'image/png' });
    const img2 = new File(['bytes2'], 'img2.jpg', { type: 'image/jpeg' });
    component.addFiles([img1, img2]);

    expect(component.selectedFiles().length).toBe(2);
    component.removeFile(0);
    expect(component.selectedFiles().length).toBe(1);
    expect(component.selectedFiles()[0].name).toBe('img2.jpg');
  });

  it('should intercept confirmed duplicate on submit and block submission', () => {
    const ticketService = TestBed.inject(TicketService);
    const mockMatch = {
      ticketId: 'dup-123',
      ticketNumber: 'T-DUP001',
      title: 'Classroom projector broken',
      description: 'Projector will not turn on',
      status: 'NEW' as any,
      category: 'IT_SECURITY',
      building: 'Science Hall',
      room: '101',
      createdAt: '2026-10-28T10:00:00Z',
      similarityScore: 0.85,
      matchLevel: 'Confirmed' as const,
      reason: 'Describes the same problem'
    };

    ticketService.checkDuplicate = () => of({
      isDuplicate: true,
      hasPotentialDuplicates: false,
      primaryMatch: mockMatch,
      matches: [mockMatch]
    });

    component.form.patchValue({
      title: 'The classroom projector is broken',
      category: 'IT_SECURITY',
      building: 'Science Hall',
      floor: '1',
      room: '101',
      priority: 'HIGH',
      description: 'Projector in room 101 stopped working completely'
    });

    component.onSubmit();

    expect(component.confirmedDuplicate()).toBeTruthy();
    expect(component.confirmedDuplicate()?.ticketId).toBe('dup-123');
    expect(component.submitting()).toBe(false);
  });

  it('should handle potential duplicate and allow proceeding anyway', () => {
    const ticketService = TestBed.inject(TicketService);
    const mockMatch = {
      ticketId: 'pot-456',
      ticketNumber: 'T-POT002',
      title: 'Podium cable loose',
      description: 'Cable loose near podium',
      status: 'NEW' as any,
      category: 'IT_SECURITY',
      building: 'Science Hall',
      room: '101',
      createdAt: '2026-10-28T10:00:00Z',
      similarityScore: 0.45,
      matchLevel: 'Potential' as const,
      reason: 'Similar wording'
    };

    let createdTicketDto: any = null;
    ticketService.checkDuplicate = () => of({
      isDuplicate: false,
      hasPotentialDuplicates: true,
      matches: [mockMatch]
    });

    ticketService.createTicket = (dto) => {
      createdTicketDto = dto;
      return of({ id: 'new-999', ticketNumber: 'T-999' } as any);
    };

    component.form.patchValue({
      title: 'New projector bulb needed',
      category: 'IT_SECURITY',
      building: 'Science Hall',
      floor: '1',
      room: '101',
      priority: 'MEDIUM',
      description: 'Projector bulb is flickering and needs replacement soon'
    });

    component.onSubmit();

    expect(component.potentialDuplicates().length).toBe(1);
    expect(component.acknowledgedPotentialDuplicates()).toBe(false);

    // Reporter clicks "My Issue is Different — Submit Anyway"
    component.proceedAnyway();

    expect(component.acknowledgedPotentialDuplicates()).toBe(true);
    expect(createdTicketDto).toBeTruthy();
    expect(createdTicketDto.ignorePotentialDuplicates).toBe(true);
  });
});

