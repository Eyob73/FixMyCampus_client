import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketStatus, TicketPriority } from '../../models/ticket.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
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
        case 'critical':
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
}
