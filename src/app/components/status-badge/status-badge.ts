<<<<<<< HEAD
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketStatus, TicketPriority } from '../../core/models/ticket.model';
=======
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketStatus } from '../../core/models/ticket.model';
>>>>>>> technician

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
<<<<<<< HEAD
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css'
})
export class StatusBadge {
  status = input<TicketStatus | string>('new');
  priority = input<TicketPriority | string | undefined>(undefined);
  size = input<'sm' | 'md'>('md');

  readonly config = computed(() => {
    if (this.priority()) {
      switch (this.priority()?.toLowerCase()) {
        case 'urgent':
          return {
            label: 'Urgent',
            classes: 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]',
            dotColor: 'bg-[#DC2626]'
          };
        case 'high':
          return {
            label: 'High Priority',
            classes: 'text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]',
            dotColor: 'bg-[#D97706]'
          };
        case 'medium':
          return {
            label: 'Medium',
            classes: 'text-[#0369A1] bg-[#F0F9FF] border-[#BAE6FD]',
            dotColor: 'bg-[#0284C7]'
          };
        case 'low':
        default:
          return {
            label: 'Low',
            classes: 'text-[#475569] bg-[#F1F5F9] border-[#CBD5E1]',
            dotColor: 'bg-[#64748B]'
          };
      }
    }

    switch (this.status().toLowerCase()) {
      case 'new':
      case 'submitted':
        return {
          label: 'New',
          classes: 'text-[#4F46E5] bg-[#EEF2FF] border-[#C7D2FE]',
          dotColor: 'bg-[#4F46E5]'
        };
      case 'assigned':
        return {
          label: 'Assigned',
          classes: 'text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]',
          dotColor: 'bg-[#D97706]'
        };
      case 'in_progress':
      case 'inprogress':
        return {
          label: 'In Progress',
          classes: 'text-[#0369A1] bg-[#F0F9FF] border-[#BAE6FD]',
          dotColor: 'bg-[#0284C7]'
        };
      case 'resolved':
        return {
          label: 'Resolved',
          classes: 'text-[#047857] bg-[#ECFDF5] border-[#A7F3D0]',
          dotColor: 'bg-[#10B981]'
        };
      case 'closed':
        return {
          label: 'Closed',
          classes: 'text-[#475569] bg-[#F1F5F9] border-[#CBD5E1]',
          dotColor: 'bg-[#64748B]'
        };
      default:
        return {
          label: this.status(),
          classes: 'text-[#475569] bg-[#F1F5F9] border-[#CBD5E1]',
          dotColor: 'bg-[#64748B]'
        };
    }
  });
=======
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase border transition-all duration-150"
      [ngClass]="badgeClasses"
    >
      <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="dotClasses"></span>
      <span>{{ labelText }}</span>
    </span>
  `,
})
export class StatusBadge {
  @Input({ required: true }) status: TicketStatus | string = 'ASSIGNED';

  get labelText(): string {
    if (!this.status) return 'UNKNOWN';
    switch (this.status) {
      case 'NEW':
        return 'NEW';
      case 'ASSIGNED':
        return 'ASSIGNED';
      case 'IN_PROGRESS':
        return 'IN PROGRESS';
      case 'RESOLVED':
        return 'RESOLVED';
      case 'CLOSED':
        return 'CLOSED';
      default:
        return this.status.replace('_', ' ');
    }
  }

  get badgeClasses(): string {
    switch (this.status) {
      case 'NEW':
        return 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]';
      case 'ASSIGNED':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
      case 'IN_PROGRESS':
        return 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]';
      case 'RESOLVED':
        return 'bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]';
      case 'CLOSED':
        return 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  }

  get dotClasses(): string {
    switch (this.status) {
      case 'NEW':
        return 'bg-[#4F46E5]';
      case 'ASSIGNED':
        return 'bg-[#D97706]';
      case 'IN_PROGRESS':
        return 'bg-[#0284C7]';
      case 'RESOLVED':
        return 'bg-[#10B981]';
      case 'CLOSED':
        return 'bg-[#475569]';
      default:
        return 'bg-slate-500';
    }
  }
>>>>>>> technician
}
