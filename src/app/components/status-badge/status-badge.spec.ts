import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  let fixture: ComponentFixture<StatusBadge>;
  let component: StatusBadge;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadge]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadge);
    component = fixture.componentInstance;
  });

  it('should render correct label for "new" status', () => {
    fixture.componentRef.setInput('status', 'new');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('New');
  });

  it('should render correct label for "in_progress" status', () => {
    fixture.componentRef.setInput('status', 'in_progress');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('In Progress');
  });

  it('should render priority label when priority is set', () => {
    fixture.componentRef.setInput('priority', 'urgent');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Urgent');
  });
});
