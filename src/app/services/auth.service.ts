import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, tap, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, User, UserRole, UpdateProfileDto } from '../models';

export const SUPPORTED_ROLES: readonly UserRole[] = ['ADMIN', 'TECHNICIAN', 'REPORTER'] as const;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'fmc_auth_token';
  private readonly USER_KEY = 'fmc_auth_user';

  private readonly currentUserSignal = signal<User | null>(this.getStoredUser());
  public readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  public isAuthenticated(): boolean {
    return this.currentUserSignal() !== null && Boolean(this.getToken());
  }

  public getUserRole(): UserRole | null {
    return this.currentUserSignal()?.role || null;
  }

  public isAdmin(): boolean {
    return this.currentUserSignal()?.role === 'ADMIN';
  }

  public isTechnician(): boolean {
    return this.currentUserSignal()?.role === 'TECHNICIAN';
  }

  public isReporter(): boolean {
    return this.currentUserSignal()?.role === 'REPORTER';
  }

  public getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  /**
   * Determine redirect route based on verified role
   */
  public getRedirectRouteForRole(role: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'REPORTER':
        return '/reporter/dashboard';
      case 'TECHNICIAN':
        return '/technician/dashboard';
      default:
        return '/login';
    }
  }

  /**
   * Primary authentication method calling backend login endpoint
   */
  public login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => this.processAuthResponse(response, credentials.rememberMe ?? false)),
      tap((authData) => {
        this.currentUserSignal.set(authData.user);
      }),
      catchError((error: HttpErrorResponse | Error) => {
        if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
          return throwError(() => error);
        }

        const httpError = error as HttpErrorResponse;
        let errorMessage = 'An unexpected error occurred during authentication.';

        if (httpError.status === 401) {
          errorMessage = 'Invalid university email or password. Please verify your credentials and try again.';
        } else if (httpError.status === 403) {
          errorMessage = 'This account has been deactivated or disabled. Please contact campus facilities administration.';
        } else if (httpError.status === 404) {
          errorMessage = 'Authentication endpoint not found (HTTP 404). Please ensure the backend API is running.';
        } else if (httpError.status === 0) {
          errorMessage = 'Unable to reach the authentication server. Please check your network connection or ensure the API service is active.';
        } else if (httpError.error?.message) {
          errorMessage = httpError.error.message;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Update User Profile
   */
  public updateProfile(dto: UpdateProfileDto): Observable<User> {
    const currentUser = this.currentUserSignal();
    if (!currentUser) {
      return throwError(() => new Error('No user is currently logged in.'));
    }

    return this.http.put<User>(`${this.apiUrl}/profile`, dto).pipe(
      map(updatedUser => {
        // Fallback merge just in case API doesn't return full user
        const mergedUser: User = {
          ...currentUser,
          ...updatedUser
        };
        this.currentUserSignal.set(mergedUser);
        
        // Update the stored user
        const storage = localStorage.getItem(this.USER_KEY) ? localStorage : sessionStorage;
        storage.setItem(this.USER_KEY, JSON.stringify(mergedUser));
        
        return mergedUser;
      })
    );
  }

  /**
   * Parse backend response, validate token and user role
   */
  private processAuthResponse(response: any, rememberMe: boolean): AuthResponse {
    if (!response) {
      throw new Error('Empty response received from authentication server.');
    }

    // Extract token
    const token = response.token || response.accessToken || (typeof response === 'string' ? response : null);
    if (!token) {
      throw new Error('Authentication response is missing a valid security token.');
    }

    // Extract user profile
    const rawUser = response.user || response.data?.user || response;
    const roleValue = rawUser.role || response.role || (response.roles && response.roles.length > 0 ? response.roles[0] : '');
    const rawRole = roleValue.toString().trim().toUpperCase();

    // Check account status
    if (rawUser.isActive === false || response.isActive === false) {
      throw new Error('This account has been deactivated or suspended. Please contact facilities support.');
    }

    // Validate supported role
    if (!rawRole || !SUPPORTED_ROLES.includes(rawRole as UserRole)) {
      // Per specification: Do not redirect to an unauthorized page. Display error and log for debugging.
      console.error(
        '[AuthService] Unknown or unsupported user role returned from authentication backend:',
        rawRole,
        response
      );
      throw new Error(
        `Unsupported account role: "${rawRole || 'Unassigned'}". Please contact your campus system administrator.`
      );
    }

    const validatedUser: User = {
      id: rawUser.id || rawUser.userId || 'usr-' + Math.random().toString(36).substring(2, 8),
      name: rawUser.name || rawUser.fullName || rawUser.email?.split('@')[0] || 'Campus User',
      email: rawUser.email || '',
      role: rawRole as UserRole,
      avatarUrl: rawUser.avatarUrl,
      department: rawUser.department,
      isActive: true
    };

    // Store token and user without storing sensitive password
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, token);
    storage.setItem(this.USER_KEY, JSON.stringify(validatedUser));

    // Clear the other storage to prevent conflicts
    if (rememberMe) {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }

    return {
      user: validatedUser,
      token,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn
    };
  }

  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }
}
