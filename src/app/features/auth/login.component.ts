import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LoginRequest, UserRole } from '../../models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    // If user is already authenticated, route them to their role dashboard
    if (this.authService.isAuthenticated()) {
      const role = this.authService.getUserRole();
      if (role) {
        this.redirectUser(role);
      }
    }
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const credentials: LoginRequest = {
      email: this.loginForm.value.email.trim(),
      password: this.loginForm.value.password,
      rememberMe: this.loginForm.value.rememberMe ?? false
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.notificationService.success(
          'Authentication Successful',
          `Welcome back, ${response.user.name}.`
        );
        this.redirectUser(response.user.role);
      },
      error: (err: Error) => {
        this.isSubmitting.set(false);
        const message = err.message || 'Authentication failed. Please verify your credentials.';
        this.errorMessage.set(message);
        this.notificationService.error('Sign In Failed', message);
      }
    });
  }

  private redirectUser(role: UserRole): void {
    // If returnUrl is provided and matches role permissions
    if (this.returnUrl && this.isUrlAllowedForRole(this.returnUrl, role)) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    const targetRoute = this.authService.getRedirectRouteForRole(role);
    this.router.navigate([targetRoute]);
  }

  private isUrlAllowedForRole(url: string, role: UserRole): boolean {
    if (url.startsWith('/admin') && role !== 'ADMIN') {
      return false;
    }
    return true;
  }
}
