import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketPriority } from '../../models/ticket.model';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold tracking-tight border transition-colors"
      [ngClass]="classes"
    >
      <span class="material-symbols-outlined text-[13px] leading-none">{{ icon }}</span>
      <span>{{ priority }}</span>
    </span>
  `,
})
export class PriorityBadge {
  @Input({ required: true }) priority: TicketPriority | string = 'MEDIUM';

  get icon(): string {
    switch (this.priority) {
      case 'CRITICAL':
        return 'warning';
      case 'HIGH':
        return 'priority_high';
      case 'MEDIUM':
        return 'remove';
      case 'LOW':
        return 'arrow_downward';
      default:
        return 'info';
    }
  }

  get classes(): string {
    switch (this.priority) {
      case 'CRITICAL':
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
      case 'HIGH':
        return 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]';
      case 'MEDIUM':
        return 'bg-[#F0F9FF] text-[#0369A1] border-[#E0F2FE]';
      case 'LOW':
        return 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }
}
