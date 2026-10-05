import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketStatus } from '../../core/models/ticket.model';

export interface TimelineStep {
  key: TicketStatus;
  label: string;
  sublabel: string;
  icon: string;
}

@Component({
  selector: 'app-ticket-status-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-status-tracker.html',
  styleUrl: './ticket-status-tracker.css'
})
export class TicketStatusTracker {
  currentStatus = input<TicketStatus | string>('new');
  orientation = input<'horizontal' | 'vertical'>('horizontal');

  readonly steps: TimelineStep[] = [
    { key: 'new', label: 'Submitted', sublabel: 'Issue registered', icon: 'send' },
    { key: 'assigned', label: 'Assigned', sublabel: 'Technician dispatched', icon: 'person_pin' },
    { key: 'in_progress', label: 'In Progress', sublabel: 'Active repair underway', icon: 'engineering' },
    { key: 'resolved', label: 'Resolved', sublabel: 'Work finished', icon: 'task_alt' },
    { key: 'closed', label: 'Closed', sublabel: 'Inspection completed', icon: 'verified' }
  ];

  readonly currentStepIndex = computed(() => {
    const s = this.currentStatus().toLowerCase();
    switch (s) {
      case 'new':
      case 'submitted':
        return 0;
      case 'assigned':
        return 1;
      case 'in_progress':
      case 'inprogress':
        return 2;
      case 'resolved':
        return 3;
      case 'closed':
        return 4;
      default:
        return 0;
    }
  });

  isStepCompleted(index: number): boolean {
    return index < this.currentStepIndex();
  }

  isStepActive(index: number): boolean {
    return index === this.currentStepIndex();
  }
}
