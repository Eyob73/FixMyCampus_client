import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white border border-slate-200 rounded-lg p-5 transition-all duration-150 relative overflow-hidden group"
      [ngClass]="{
        'hover:border-slate-300 hover:shadow-md cursor-pointer': clickable,
        'ring-2 ring-primary border-primary': active
      }"
      (click)="onClick()"
    >
      <div class="flex items-center justify-between gap-3 mb-3">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ label }}</span>
        <div
          class="w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          [ngClass]="iconContainerClass"
        >
          <span class="material-symbols-outlined text-lg" [ngClass]="iconColorClass">
            {{ icon }}
          </span>
        </div>
      </div>

      <div class="flex items-baseline justify-between gap-2">
        <span class="text-2xl lg:text-3xl font-bold text-slate-900 font-stat-numeric tracking-tight">
          {{ value }}
        </span>
        @if (trendText) {
          <span
            class="text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-0.5"
            [ngClass]="trendPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
          >
            <span class="material-symbols-outlined text-xs">
              {{ trendPositive ? 'trending_up' : 'trending_down' }}
            </span>
            {{ trendText }}
          </span>
        }
      </div>

      @if (subtext) {
        <p class="text-xs text-slate-400 mt-2 flex items-center gap-1">
          {{ subtext }}
        </p>
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
