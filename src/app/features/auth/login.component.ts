import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['s.jenkins@facilities.campus.edu', [Validators.required, Validators.email]],
      password: ['••••••••••••', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    setTimeout(() => {
      this.authService.login(this.form.value.email, 'ADMIN');
      this.notificationService.success('Welcome back', 'Admin session verified.');
      this.isSubmitting = false;
    }, 400);
  }

  quickAdminLogin(): void {
    this.form.patchValue({
      email: 's.jenkins@facilities.campus.edu',
      password: 'password123'
    });
    this.onSubmit();
  }
}
