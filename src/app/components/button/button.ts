import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  icon = input<string | undefined>(undefined);
  trailingIcon = input<string | undefined>(undefined);
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  fullWidth = input<boolean>(false);

  btnClick = output<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.btnClick.emit(event);
    }
  }
}
