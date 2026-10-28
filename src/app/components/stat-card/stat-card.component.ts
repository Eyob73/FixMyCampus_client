import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card
      appearance="outlined"
      class="!bg-white !border-[#E2E8F0] !rounded-[14px] p-[1.125rem_1.25rem] !shadow-sm cursor-default"
      (click)="onClick()"
    >
      <div class="flex items-center justify-between">
        <span class="text-[0.9rem] font-semibold text-[#0F172A] tracking-tight">{{ label }}</span>
        <div
          class="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center border shrink-0 transition-transform"
          [ngClass]="iconContainerClass"
        >
          <span class="material-symbols-outlined text-[1.25rem]">
            {{ icon }}
          </span>
        </div>
      </div>

      <div class="mt-3 flex items-baseline space-x-2">
        <span class="text-[1.5rem] font-bold font-mono text-[#0F172A] leading-none">
          {{ value }}
        </span>
        @if (trendText) {
          <span
            class="text-[11px] font-semibold px-1.5 py-0.5 rounded"
            [ngClass]="badgeClass"
          >
            {{ trendText }}
          </span>
        }
      </div>

      @if (subtext) {
        <p class="mt-1 text-[0.775rem] text-[#64748B] m-0">
          {{ subtext }}
        </p>
      }
    </mat-card>
  `
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: number | string;
  @Input({ required: true }) icon!: string;
  @Input() iconVariant: 'primary' | 'amber' | 'sky' | 'emerald' | 'rose' | 'cyan' | 'slate' = 'primary';
  @Input() trendText?: string;
  @Input() trendPositive = true;
  @Input() subtext?: string;
  @Input() clickable = false;
  @Input() active = false;

  @Output() cardClick = new EventEmitter<void>();

  onClick(): void {
    if (this.clickable) {
      this.cardClick.emit();
    }
  }

  get iconContainerClass(): string {
    switch (this.iconVariant) {
      case 'amber':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
      case 'sky':
        return 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]';
      case 'emerald':
        return 'bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]';
      case 'rose':
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
      case 'cyan':
        return 'bg-[#ECFEFF] text-[#0891B2] border-[#A5F3FC]';
      case 'slate':
        return 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]';
      case 'primary':
      default:
        return 'bg-[#EFF6FF] text-[#1E3A8A] border-[#DBEAFE]';
    }
  }

  get badgeClass(): string {
    switch (this.iconVariant) {
      case 'amber':
        return 'text-[#D97706] bg-[#FFFBEB]';
      case 'sky':
        return 'text-[#0284C7] bg-[#F0F9FF]';
      case 'emerald':
        return 'text-[#10B981] bg-[#ECFDF5]';
      case 'rose':
        return 'text-[#DC2626] bg-[#FEF2F2]';
      case 'cyan':
        return 'text-[#0891B2] bg-[#ECFEFF]';
      case 'slate':
        return 'text-[#475569] bg-[#F1F5F9]';
      case 'primary':
      default:
        return 'text-[#1E3A8A] bg-[#EFF6FF]';
    }
  }
}
