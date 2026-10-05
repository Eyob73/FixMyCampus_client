import { Injectable, signal } from '@angular/core';
import { User } from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Currently authenticated technician as defined by the application context
  private readonly defaultTechnician: User = {
    id: 'tech-101',
    name: 'Dave Miller',
    email: 'd.miller@campus.edu',
    role: 'TECHNICIAN',
    department: 'AV & Media Facilities Services',
    phone: '+1 (555) 392-1082',
    avatarUrl: '',
  };

  private readonly _currentUser = signal<User>(this.loadUser());

  readonly currentUser = this._currentUser.asReadonly();

  private loadUser(): User {
    const saved = localStorage.getItem('fmc_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back to default
      }
    }
    return this.defaultTechnician;
  }

  isTechnician(): boolean {
    return this._currentUser().role === 'TECHNICIAN';
  }

  getTechnicianId(): string {
    return this._currentUser().id;
  }

  getTechnicianName(): string {
    return this._currentUser().name;
  }

  updateProfile(updates: Partial<User>): void {
    const updated = { ...this._currentUser(), ...updates };
    this._currentUser.set(updated);
    localStorage.setItem('fmc_auth_user', JSON.stringify(updated));
  }

  logout(): void {
    // In production this revokes tokens; for demo it keeps technician session
    localStorage.removeItem('fmc_auth_user');
    this._currentUser.set(this.defaultTechnician);
  }
}
