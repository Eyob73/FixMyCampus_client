import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketStatus } from '../../core/models/ticket.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
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
}
