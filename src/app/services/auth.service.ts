import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, catchError, filter, map, switchMap, take, tap, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, User, UserRole, UpdateProfileDto } from '../models';

export const SUPPORTED_ROLES: readonly UserRole[] = ['ADMIN', 'TECHNICIAN', 'REPORTER'] as const;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly LEGACY_TOKEN_KEY = 'fmc_auth_token';
  private readonly LEGACY_REFRESH_TOKEN_KEY = 'fmc_refresh_token';
  private readonly USER_KEY = 'fmc_auth_user';

  private readonly currentUserSignal = signal<User | null>(this.getStoredUser());
  public readonly currentUser = this.currentUserSignal.asReadonly();

  // Concurrency coordinator for refresh token single-flight execution
  private isRefreshing = false;
  private readonly refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTimer: any = null;
  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === this.ACCESS_TOKEN_KEY || event.key === this.LEGACY_TOKEN_KEY) {
          if (event.newValue) {
            this.scheduleTokenRefresh(event.newValue);
          } else {
            this.currentUserSignal.set(null);
            this.cancelTokenRefresh();
          }
        }
      });

      // Schedule refresh on initialization if token exists and valid
      const currentToken = this.getToken();
      if (currentToken && !this.isTokenExpired(currentToken)) {
        this.scheduleTokenRefresh(currentToken);
      }
    }
  }

  public setTokens(accessToken: string, refreshToken?: string, rememberMe: boolean = true): void {
    const primaryStorage = rememberMe ? localStorage : sessionStorage;
    const secondaryStorage = rememberMe ? sessionStorage : localStorage;

    primaryStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    primaryStorage.setItem(this.LEGACY_TOKEN_KEY, accessToken);
    secondaryStorage.removeItem(this.ACCESS_TOKEN_KEY);
    secondaryStorage.removeItem(this.LEGACY_TOKEN_KEY);

    if (refreshToken) {
      primaryStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      primaryStorage.setItem(this.LEGACY_REFRESH_TOKEN_KEY, refreshToken);
      secondaryStorage.removeItem(this.REFRESH_TOKEN_KEY);
      secondaryStorage.removeItem(this.LEGACY_REFRESH_TOKEN_KEY);
    }

    this.scheduleTokenRefresh(accessToken);
  }

  public setToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    localStorage.setItem(this.LEGACY_TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return (
      localStorage.getItem(this.ACCESS_TOKEN_KEY) ||
      localStorage.getItem(this.LEGACY_TOKEN_KEY) ||
      sessionStorage.getItem(this.ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem(this.LEGACY_TOKEN_KEY)
    );
  }

  public setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.LEGACY_REFRESH_TOKEN_KEY, refreshToken);
  }

  public getRefreshToken(): string | null {
    return (
      localStorage.getItem(this.REFRESH_TOKEN_KEY) ||
      localStorage.getItem(this.LEGACY_REFRESH_TOKEN_KEY) ||
      sessionStorage.getItem(this.REFRESH_TOKEN_KEY) ||
      sessionStorage.getItem(this.LEGACY_REFRESH_TOKEN_KEY)
    );
  }

  public removeTokens(): void {
    this.cancelTokenRefresh();
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.LEGACY_TOKEN_KEY);
    localStorage.removeItem(this.LEGACY_REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.LEGACY_TOKEN_KEY);
    sessionStorage.removeItem(this.LEGACY_REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  public removeToken(): void {
    this.removeTokens();
  }

  public decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  public isTokenExpired(token?: string | null, bufferSeconds = 30): boolean {
    const t = token ?? this.getToken();
    if (!t) return true;
    const decoded = this.decodeToken(t);
    if (!decoded || !decoded.exp) return true;
    const expiresAtMs = decoded.exp * 1000;
    return Date.now() >= (expiresAtMs - (bufferSeconds * 1000));
  }

  public scheduleTokenRefresh(token?: string | null): void {
    this.cancelTokenRefresh();
    const t = token ?? this.getToken();
    if (!t || typeof window === 'undefined') return;

    const decoded = this.decodeToken(t);
    if (!decoded || !decoded.exp) return;

    const expiresAtMs = decoded.exp * 1000;
    const now = Date.now();
    // Proactively refresh 2 minutes before access token expiry
    const refreshBufferMs = 2 * 60 * 1000;
    let delayMs = expiresAtMs - now - refreshBufferMs;

    // If already within buffer or expired, schedule shortly
    if (delayMs <= 0) {
      delayMs = 5000;
    }

    this.refreshTimer = setTimeout(() => {
      this.refresh().subscribe({
        error: (err) => {
          // If refresh fails due to temporary network error, retry after 15 seconds
          if (err?.status === 0 || (err?.status >= 500 && err?.status <= 504)) {
            this.refreshTimer = setTimeout(() => this.scheduleTokenRefresh(), 15000);
          }
        }
      });
    }, delayMs);
  }

  public cancelTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
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

  private isRememberMe(): boolean {
    return (
      localStorage.getItem(this.ACCESS_TOKEN_KEY) !== null ||
      localStorage.getItem(this.LEGACY_TOKEN_KEY) !== null
    );
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
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
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
        
        const backendMessage = (httpError.error?.message || httpError.error?.Message || '').toLowerCase();

        if (httpError.status === 401) {
          if (backendMessage.includes('locked out')) {
            errorMessage = 'Your account has been locked due to too many failed attempts. Please try again after 15 minutes.';
          } else if (backendMessage.includes('confirm')) {
            errorMessage = 'Please confirm your email address before signing in.';
          } else {
            errorMessage = 'Invalid university email or password. Please verify your credentials and try again.';
          }
        } else if (httpError.status === 403) {
          errorMessage = 'This account has been deactivated or disabled. Please contact campus facilities administration.';
        } else if (httpError.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (httpError.status === 404) {
          errorMessage = 'Authentication endpoint not found (HTTP 404). Please ensure the backend API is running.';
        } else if (httpError.status === 0) {
          errorMessage = 'Unable to reach the authentication server. Please check your network connection or ensure the API service is active.';
        } else if (backendMessage) {
          errorMessage = httpError.error?.message || httpError.error?.Message;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Request a new access token using the refresh token (via HttpOnly cookie or fallback body)
   */
  public refresh(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    const payload = refreshToken ? { refreshToken } : {};

    return this.http.post<any>(`${this.apiUrl}/refresh`, payload, { withCredentials: true }).pipe(
      map((response) => this.processAuthResponse(response, this.isRememberMe())),
      tap((authData) => {
        const token = authData.token;
        if (token) {
          this.setTokens(token, authData.refreshToken);
        }
        this.currentUserSignal.set(authData.user);
      })
    );
  }

  public refreshToken(): Observable<AuthResponse> {
    return this.refresh();
  }

  /**
   * Coordinates single-flight refresh for concurrent 401 errors across multiple API requests
   */
  public handle401Error(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.refreshToken().pipe(
        switchMap((authData) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(authData.token);
          return next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${authData.token}`,
                'X-Refresh-Retry': 'true'
              },
              withCredentials: true
            })
          );
        }),
        catchError((refreshError) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          this.logout(true);
          return throwError(() => refreshError);
        })
      );
    } else {
      // Refresh already in flight: wait until new token is emitted, then retry request
      return this.refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((token) => {
          return next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
                'X-Refresh-Retry': 'true'
              },
              withCredentials: true
            })
          );
        })
      );
    }
  }

  /**
   * Update User Profile
   */
  public updateProfile(dto: UpdateProfileDto): Observable<User> {
    const currentUser = this.currentUserSignal();
    if (!currentUser) {
      return throwError(() => new Error('No user is currently logged in.'));
    }

    return this.http.put<User>(`${this.apiUrl}/profile`, dto, { withCredentials: true }).pipe(
      map(updatedUser => {
        const mergedUser: User = {
          ...currentUser,
          ...updatedUser
        };
        this.currentUserSignal.set(mergedUser);
        
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

    // Store token and user
    this.setTokens(token, response.refreshToken, rememberMe);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.USER_KEY, JSON.stringify(validatedUser));

    return {
      user: validatedUser,
      token,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn
    };
  }

  public logout(redirect: boolean = true): void {
    const refreshToken = this.getRefreshToken();
    this.http.post<any>(`${this.apiUrl}/logout`, { refreshToken: refreshToken || null }, { withCredentials: true }).subscribe({
      error: () => {}
    });

    this.removeTokens();
    this.currentUserSignal.set(null);

    if (redirect) {
      this.router.navigate(['/login']);
    }
  }
}
