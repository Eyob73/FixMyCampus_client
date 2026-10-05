import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  departmentOrHall?: string;
  phone?: string;
  avatarUrl?: string;
  affiliation?: string;
  accountStatus?: string;
  notificationPreferences?: any;
}

export interface UpdateProfileDto {
  name: string;
  phone?: string;
  departmentOrHall?: string;
  affiliation?: string;
  notificationPreferences?: any;
}

const USER_STORAGE_KEY = 'fixmycampus_current_user';

const defaultTechnician: User = {
  id: 'tech-101',
  name: 'Dave Miller',
  email: 'd.miller@campus.edu',
  role: 'TECHNICIAN',
  department: 'AV & Media Facilities Services',
  phone: '+1 (555) 392-1082',
  avatarUrl: '',
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User>(this.loadInitialUser());
  readonly currentUser = this.userSignal.asReadonly();
  readonly isReporter = computed(() => this.userSignal().role === 'reporter' || this.userSignal().role === 'STUDENT');

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
    return { ...defaultTechnician };
  }

  getCurrentUser(): User {
    return this.userSignal();
  }

  isTechnician(): boolean {
    return this.userSignal().role === 'TECHNICIAN';
  }

  getTechnicianId(): string {
    return this.userSignal().id;
  }

  getTechnicianName(): string {
    return this.userSignal().name;
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

    this.persistUser(updatedUser);
    return of(updatedUser);
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
    this.userSignal.set({ ...defaultTechnician });
  }
}
