import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { adminGuard } from './admin.guard';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('Auth & Role Guards', () => {
  let authServiceSpy: any;
  let routerSpy: { navigate: any };
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = { url: '/admin/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = {
      isAuthenticated: vi.fn(),
      isAdmin: vi.fn(),
      getUserRole: vi.fn(),
      getRedirectRouteForRole: vi.fn((role: string) => `/${role.toLowerCase()}/dashboard`)
    };

    routerSpy = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  describe('adminGuard', () => {
    it('should allow access if user is authenticated and has ADMIN role', () => {
      authServiceSpy.isAuthenticated.mockReturnValue(true);
      authServiceSpy.isAdmin.mockReturnValue(true);

      const result = TestBed.runInInjectionContext(() => adminGuard(dummyRoute, dummyState));
      expect(result).toBe(true);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should redirect non-admin authenticated users to their own role dashboard', () => {
      authServiceSpy.isAuthenticated.mockReturnValue(true);
      authServiceSpy.isAdmin.mockReturnValue(false);
      authServiceSpy.getUserRole.mockReturnValue('TECHNICIAN');

      const result = TestBed.runInInjectionContext(() => adminGuard(dummyRoute, dummyState));
      expect(result).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/technician/dashboard']);
    });

    it('should redirect unauthenticated users to /login with returnUrl', () => {
      authServiceSpy.isAuthenticated.mockReturnValue(false);

      const result = TestBed.runInInjectionContext(() => adminGuard(dummyRoute, dummyState));
      expect(result).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/admin/dashboard' } });
    });
  });

  describe('roleGuard', () => {
    it('should allow access if user role matches allowed roles', () => {
      authServiceSpy.isAuthenticated.mockReturnValue(true);
      authServiceSpy.getUserRole.mockReturnValue('REPORTER');

      const guard = roleGuard(['REPORTER']);
      const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));
      expect(result).toBe(true);
    });

    it('should redirect user if role does not match allowed roles', () => {
      authServiceSpy.isAuthenticated.mockReturnValue(true);
      authServiceSpy.getUserRole.mockReturnValue('REPORTER');

      const guard = roleGuard(['TECHNICIAN']);
      const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));
      expect(result).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/reporter/dashboard']);
    });
  });
});
