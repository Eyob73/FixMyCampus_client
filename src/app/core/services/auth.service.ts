<<<<<<< HEAD
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { User, UpdateProfileDto } from '../models/user.model';
import { CURRENT_REPORTER } from './mock-data';
import { environment } from '../../../environments/environment';

const USER_STORAGE_KEY = 'fixmycampus_current_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User>(this.loadInitialUser());
  readonly currentUser = this.userSignal.asReadonly();
  readonly isReporter = computed(() => this.userSignal().role === 'reporter');

  constructor(private http: HttpClient) {}

  private loadInitialUser(): User {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read user from storage', e);
    }
    return { ...CURRENT_REPORTER };
  }

  getCurrentUser(): User {
    return this.userSignal();
  }

  updateProfile(dto: UpdateProfileDto): Observable<User> {
    const updatedUser: User = {
      ...this.userSignal(),
      name: dto.name,
      phone: dto.phone ?? this.userSignal().phone,
      departmentOrHall: dto.departmentOrHall ?? this.userSignal().departmentOrHall,
      affiliation: dto.affiliation ?? this.userSignal().affiliation,
      notificationPreferences: dto.notificationPreferences ?? this.userSignal().notificationPreferences
    };

    // Attempt backend update
    return this.http.put<User>(`${environment.apiUrl}/profile`, dto).pipe(
      tap((user) => {
        this.persistUser(user);
      }),
      catchError(() => {
        // Fallback to local persistence for seamless operation
        this.persistUser(updatedUser);
        return of(updatedUser);
      })
    );
  }

  private persistUser(user: User): void {
    this.userSignal.set(user);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to persist user to localStorage', e);
    }
  }

  logout(): void {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {}
    this.userSignal.set({ ...CURRENT_REPORTER });
=======
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
>>>>>>> technician
  }
}
