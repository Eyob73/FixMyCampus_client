import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white border border-slate-200 rounded-[14px] p-[1.125rem_1.25rem] transition-all duration-200 relative overflow-hidden group flex items-center gap-4"
      [ngClass]="{
        'hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:border-primary cursor-pointer': clickable,
        'border-primary shadow-[0_8px_24px_rgba(0,0,0,0.18)]': active
      }"
      (click)="onClick()"
    >
      <div
        class="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
        [ngClass]="iconContainerClass"
      >
        <span class="material-symbols-outlined text-[1.25rem] w-[1.25rem] h-[1.25rem] flex items-center justify-center" [ngClass]="iconColorClass">
          {{ icon }}
        </span>
      </div>

      <div class="flex flex-col gap-[0.15rem] flex-1">
        <div class="flex justify-between items-center gap-2">
          <span class="text-[0.9rem] font-semibold text-slate-900 tracking-tight">{{ label }}</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-[1.5rem] font-bold text-slate-900 font-stat-numeric tracking-tight leading-none">
            {{ value }}
          </span>
        </div>
        @if (trendText) {
          <span
            class="text-[0.775rem] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 mt-1"
            [ngClass]="trendPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
          >
            <span class="material-symbols-outlined text-[0.775rem]">
              {{ trendPositive ? 'trending_up' : 'trending_down' }}
            </span>
            {{ trendText }}
          </span>
        }
        @if (subtext) {
          <p class="text-[0.775rem] text-slate-500 m-0">
            {{ subtext }}
          </p>
        }
      </div>

      @if (clickable) {
        <span class="material-symbols-outlined text-[1.1rem] w-[1.1rem] h-[1.1rem] text-slate-400 group-hover:text-primary transition-colors">
          chevron_right
        </span>
      }
    </div>
  `
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: number | string;
  @Input({ required: true }) icon!: string;
  @Input() iconVariant: 'primary' | 'amber' | 'sky' | 'emerald' | 'rose' | 'indigo' | 'slate' = 'primary';
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
        return 'bg-amber-50 border border-amber-200/60';
      case 'sky':
        return 'bg-sky-50 border border-sky-200/60';
      case 'emerald':
        return 'bg-emerald-50 border border-emerald-200/60';
      case 'rose':
        return 'bg-rose-50 border border-rose-200/60';
      case 'indigo':
        return 'bg-indigo-50 border border-indigo-200/60';
      case 'slate':
        return 'bg-slate-100 border border-slate-200';
      case 'primary':
      default:
        return 'bg-blue-50 border border-blue-200/60';
    }
  }

  get iconColorClass(): string {
    switch (this.iconVariant) {
      case 'amber':
        return 'text-amber-600';
      case 'sky':
        return 'text-sky-600';
      case 'emerald':
        return 'text-emerald-600';
      case 'rose':
        return 'text-rose-600';
      case 'indigo':
        return 'text-indigo-600';
      case 'slate':
        return 'text-slate-600';
      case 'primary':
      default:
        return 'text-primary';
    }
  }
}
