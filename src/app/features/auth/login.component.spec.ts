import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { AuthResponse } from '../../models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: any;
  let notificationServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      getUserRole: vi.fn().mockReturnValue(null),
      getRedirectRouteForRole: vi.fn((role: string) => `/${role.toLowerCase()}/dashboard`),
      login: vi.fn()
    };

    notificationServiceSpy = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    };

    routerSpy = {
      navigate: vi.fn(),
      navigateByUrl: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: vi.fn().mockReturnValue(null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize login form with default empty values and invalid status', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.valid).toBe(false);
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('rememberMe')?.value).toBe(false);
  });

  it('should validate email format and password length', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid.user@university.edu');
    expect(emailControl?.valid).toBe(true);

    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBe(true);
    expect(component.loginForm.valid).toBe(true);
  });

  it('should toggle password visibility signal', () => {
    expect(component.showPassword()).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(false);
  });

  it('should call authService.login and redirect to role dashboard on valid submit', () => {
    const mockAuthResponse: AuthResponse = {
      token: 'jwt-admin-token',
      user: {
        id: 'usr-admin',
        name: 'Facilities Admin',
        email: 'admin@univ.edu',
        role: 'ADMIN',
        isActive: true
      }
    };

    authServiceSpy.login.mockReturnValue(of(mockAuthResponse));

    component.loginForm.setValue({
      email: 'admin@univ.edu',
      password: 'validAdminPassword',
      rememberMe: true
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'admin@univ.edu',
      password: 'validAdminPassword',
      rememberMe: true
    });
    expect(notificationServiceSpy.success).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
    expect(component.isSubmitting()).toBe(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('should handle authentication errors by setting errorMessage signal and not redirecting', () => {
    const errorMessage = 'Invalid university email or password. Please verify your credentials and try again.';
    authServiceSpy.login.mockReturnValue(throwError(() => new Error(errorMessage)));

    component.loginForm.setValue({
      email: 'wrong@univ.edu',
      password: 'wrongPassword',
      rememberMe: false
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe(errorMessage);
    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Sign In Failed', errorMessage);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(component.isSubmitting()).toBe(false);
  });

  it('should not submit form when fields are invalid and mark controls touched', () => {
    expect(component.loginForm.valid).toBe(false);
    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.loginForm.get('email')?.touched).toBe(true);
    expect(component.loginForm.get('password')?.touched).toBe(true);
  });
});
