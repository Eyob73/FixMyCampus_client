import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketPriority, TicketStatus } from '../../models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase border transition-all"
      [ngClass]="badgeClass"
    >
      <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="dotClass"></span>
      {{ labelText }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status?: TicketStatus | string;
  @Input() priority?: TicketPriority | string;
  @Input() label?: string;

  get labelText(): string {
    if (this.label) return this.label;
    if (this.status) return this.status.replace('_', ' ');
    if (this.priority) return this.priority;
    return '';
  }

  get badgeClass(): string {
    const val = (this.status || this.priority || '').toUpperCase();
    switch (val) {
      case 'NEW':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ASSIGNED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'IN_PROGRESS':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LOW':
        return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'AVAILABLE':
      case 'ACTIVE':
      case 'OPERATIONAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'BUSY':
      case 'MAINTENANCE_SURGE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ON_CALL':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'OFF_DUTY':
      case 'INACTIVE':
      case 'RESTRICTED':
        return 'bg-slate-100 text-slate-500 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  get dotClass(): string {
    const val = (this.status || this.priority || '').toUpperCase();
    switch (val) {
      case 'NEW':
        return 'bg-indigo-600';
      case 'ASSIGNED':
        return 'bg-amber-500';
      case 'IN_PROGRESS':
        return 'bg-sky-500';
      case 'RESOLVED':
        return 'bg-emerald-600';
      case 'CLOSED':
        return 'bg-slate-500';
      case 'CRITICAL':
        return 'bg-red-600 animate-pulse';
      case 'HIGH':
        return 'bg-amber-600';
      case 'MEDIUM':
        return 'bg-blue-600';
      case 'LOW':
        return 'bg-slate-400';
      case 'AVAILABLE':
      case 'ACTIVE':
      case 'OPERATIONAL':
        return 'bg-emerald-500';
      case 'BUSY':
      case 'MAINTENANCE_SURGE':
        return 'bg-rose-500';
      case 'ON_CALL':
        return 'bg-amber-500';
      default:
        return 'bg-slate-400';
    }
  }
}
