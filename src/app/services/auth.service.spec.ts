import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;
  let routerSpy: { navigate: any };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created and start unauthenticated', () => {
    expect(service).toBeTruthy();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('should successfully authenticate and store credentials in sessionStorage when rememberMe is false', () => {
    const mockResponse = {
      token: 'jwt-valid-token-123',
      user: {
        id: 'usr-1',
        name: 'Jane Doe',
        email: 'jane@univ.edu',
        role: 'ADMIN',
        isActive: true
      }
    };

    service.login({ email: 'jane@univ.edu', password: 'secretPassword', rememberMe: false }).subscribe((res) => {
      expect(res.token).toBe('jwt-valid-token-123');
      expect(res.user.role).toBe('ADMIN');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.email).toBe('jane@univ.edu');
      expect(service.isAdmin()).toBe(true);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('jane@univ.edu');
    req.flush(mockResponse);

    // Ensure session storage received token, and password was NEVER stored
    expect(sessionStorage.getItem('fmc_auth_token')).toBe('jwt-valid-token-123');
    expect(localStorage.getItem('fmc_auth_token')).toBeNull();
    expect(localStorage.getItem('fmc_auth_password')).toBeNull();
    expect(sessionStorage.getItem('fmc_auth_password')).toBeNull();
  });

  it('should store credentials in localStorage when rememberMe is true', () => {
    const mockResponse = {
      token: 'jwt-remember-token-456',
      user: {
        id: 'usr-2',
        name: 'John Tech',
        email: 'john@univ.edu',
        role: 'TECHNICIAN',
        isActive: true
      }
    };

    service.login({ email: 'john@univ.edu', password: 'secretPassword', rememberMe: true }).subscribe((res) => {
      expect(res.token).toBe('jwt-remember-token-456');
      expect(service.isTechnician()).toBe(true);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockResponse);

    expect(localStorage.getItem('fmc_auth_token')).toBe('jwt-remember-token-456');
    expect(sessionStorage.getItem('fmc_auth_token')).toBeNull();
  });

  it('should fail and log development warning when backend returns an unknown or unsupported role', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockResponse = {
      token: 'jwt-unknown-role',
      user: {
        id: 'usr-3',
        name: 'Guest User',
        email: 'guest@univ.edu',
        role: 'SUPERVISOR_UNKNOWN',
        isActive: true
      }
    };

    service.login({ email: 'guest@univ.edu', password: 'secretPassword' }).subscribe({
      next: () => {
        throw new Error('Login should not succeed with unsupported role');
      },
      error: (err: Error) => {
        expect(err.message).toContain('Unsupported account role: "SUPERVISOR_UNKNOWN"');
        expect(service.isAuthenticated()).toBe(false);
        expect(localStorage.getItem('fmc_auth_token')).toBeNull();
        expect(sessionStorage.getItem('fmc_auth_token')).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();
      }
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockResponse);

    consoleSpy.mockRestore();
  });

  it('should reject inactive or deactivated accounts', () => {
    const mockResponse = {
      token: 'jwt-inactive',
      user: {
        id: 'usr-4',
        name: 'Disabled User',
        email: 'disabled@univ.edu',
        role: 'REPORTER',
        isActive: false
      }
    };

    service.login({ email: 'disabled@univ.edu', password: 'secretPassword' }).subscribe({
      next: () => {
        throw new Error('Login should not succeed with inactive user');
      },
      error: (err: Error) => {
        expect(err.message).toContain('deactivated or suspended');
        expect(service.isAuthenticated()).toBe(false);
      }
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockResponse);
  });

  it('should map 401 Unauthorized to invalid credentials error message', () => {
    service.login({ email: 'wrong@univ.edu', password: 'badPassword' }).subscribe({
      next: () => {
        throw new Error('Login should fail on 401');
      },
      error: (err: Error) => {
        expect(err.message).toContain('Invalid university email or password');
      }
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should map 403 Forbidden to deactivated account message', () => {
    service.login({ email: 'banned@univ.edu', password: 'password' }).subscribe({
      next: () => {
        throw new Error('Login should fail on 403');
      },
      error: (err: Error) => {
        expect(err.message).toContain('deactivated or disabled');
      }
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
  });

  it('should correctly determine redirect routes based on role', () => {
    expect(service.getRedirectRouteForRole('ADMIN')).toBe('/admin/dashboard');
    expect(service.getRedirectRouteForRole('REPORTER')).toBe('/reporter/dashboard');
    expect(service.getRedirectRouteForRole('TECHNICIAN')).toBe('/technician/dashboard');
  });

  it('should clear all tokens and navigate to /login on logout', () => {
    localStorage.setItem('fmc_auth_token', 'token');
    localStorage.setItem('fmc_refresh_token', 'refresh-token');
    sessionStorage.setItem('fmc_auth_token', 'token');

    service.logout();

    const logoutReq = httpTesting.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(logoutReq.request.method).toBe('POST');
    logoutReq.flush({ message: 'Logged out successfully.' });

    expect(localStorage.getItem('fmc_auth_token')).toBeNull();
    expect(localStorage.getItem('fmc_refresh_token')).toBeNull();
    expect(sessionStorage.getItem('fmc_auth_token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should request a new access token via refreshToken and update storage', () => {
    localStorage.setItem('fmc_auth_token', 'old-access-token');
    localStorage.setItem('fmc_refresh_token', 'old-refresh-token');

    const mockResponse = {
      accessToken: 'new-access-token-999',
      refreshToken: 'new-refresh-token-888',
      expiresIn: 900,
      user: {
        id: 'usr-1',
        name: 'Jane Doe',
        email: 'jane@univ.edu',
        role: 'ADMIN',
        isActive: true
      }
    };

    service.refreshToken().subscribe((res) => {
      expect(res.token).toBe('new-access-token-999');
      expect(res.refreshToken).toBe('new-refresh-token-888');
      expect(service.getToken()).toBe('new-access-token-999');
      expect(service.getRefreshToken()).toBe('new-refresh-token-888');
      expect(localStorage.getItem('accessToken')).toBe('new-access-token-999');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token-888');
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush(mockResponse);
  });

  it('should set and remove tokens via setTokens and removeTokens', () => {
    service.setTokens('access-123', 'refresh-456');
    expect(service.getToken()).toBe('access-123');
    expect(service.getRefreshToken()).toBe('refresh-456');
    expect(localStorage.getItem('accessToken')).toBe('access-123');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-456');

    service.removeTokens();
    expect(service.getToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('should correctly check if token is expired', () => {
    // Generate valid future token payload: exp in 1 hour
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const futurePayload = btoa(JSON.stringify({ exp: futureExp }));
    const validJwt = `header.${futurePayload}.signature`;

    expect(service.isTokenExpired(validJwt)).toBe(false);

    // Generate expired token payload: exp 1 hour ago
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const pastPayload = btoa(JSON.stringify({ exp: pastExp }));
    const expiredJwt = `header.${pastPayload}.signature`;

    expect(service.isTokenExpired(expiredJwt)).toBe(true);
    expect(service.isTokenExpired(null)).toBe(true);
  });
});

