import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly defaultAdmin: User = {
    id: 'usr-admin-01',
    name: 'Sarah Jenkins',
    email: 's.jenkins@facilities.campus.edu',
    role: 'ADMIN',
    department: 'Central Plant Operations & Facilities',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    token: 'fmc_jwt_admin_demo_token_secure_xyz'
  };

  private readonly currentUserSignal = signal<User | null>(this.getStoredUser());
  public readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(private router: Router) {
    // If no user is stored, default to Admin for seamless local development
    if (!this.currentUserSignal()) {
      this.setUser(this.defaultAdmin);
    }
  }

  private getStoredUser(): User | null {
    try {
      const data = localStorage.getItem('fmc_auth_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public setUser(user: User | null): void {
    if (user) {
      localStorage.setItem('fmc_auth_user', JSON.stringify(user));
      localStorage.setItem('fmc_auth_token', user.token || 'demo_token');
    } else {
      localStorage.removeItem('fmc_auth_user');
      localStorage.removeItem('fmc_auth_token');
    }
    this.currentUserSignal.set(user);
  }

  public getToken(): string | null {
    return localStorage.getItem('fmc_auth_token');
  }

  public isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  public isAdmin(): boolean {
    return this.currentUserSignal()?.role === 'ADMIN';
  }

  public login(email: string, role: 'ADMIN' | 'TECHNICIAN' = 'ADMIN'): void {
    const user: User = {
      id: 'usr-' + Math.random().toString(36).substring(2, 7),
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      role,
      token: 'jwt_' + Math.random().toString(36).substring(2),
      department: 'Facilities Directorate'
    };
    this.setUser(user);
    this.router.navigate(['/admin/dashboard']);
  }

  public logout(): void {
    this.setUser(null);
    this.router.navigate(['/login']);
  }
}
