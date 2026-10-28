import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ReportIssueComponent } from './report-issue.component';
import { TicketService } from '../../../services/ticket.service';

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
});
