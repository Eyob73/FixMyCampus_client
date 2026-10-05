import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.html',
  styleUrl: './form-field.css'
})
export class FormFieldComponent {
  label = input<string | undefined>(undefined);
  forId = input<string | undefined>(undefined);
  required = input<boolean>(false);
  errorMessage = input<string | undefined>(undefined);
  hint = input<string | undefined>(undefined);
}
