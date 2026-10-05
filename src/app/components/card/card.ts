import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class CardComponent {
  title = input<string | undefined>(undefined);
  subtitle = input<string | undefined>(undefined);
  noPadding = input<boolean>(false);
  hoverEffect = input<boolean>(false);
}
