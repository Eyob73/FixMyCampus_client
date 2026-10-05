import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Reporter, ReporterStatus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReporterService {
  private readonly apiUrl = `${environment.apiUrl}/reporters`;

  private readonly initialReporters: Reporter[] = [
    {
      id: 'rep-01',
      name: 'Dr. Aris Thorne',
      email: 'a.thorne@faculty.campus.edu',
      phone: '(555) 891-2345',
      department: 'Department of Chemistry',
      role: 'FACULTY',
      status: 'ACTIVE',
      submittedTicketsCount: 8,
      openTicketsCount: 2,
      lastActiveAt: '2026-10-04T14:30:00Z',
      createdAt: '2024-08-20T00:00:00Z'
    },
    {
      id: 'rep-02',
      name: 'Maya Lin',
      email: 'm.lin@student.campus.edu',
      phone: '(555) 782-9012',
      department: 'Architecture & Environmental Design',
      role: 'STUDENT',
      status: 'ACTIVE',
      submittedTicketsCount: 4,
      openTicketsCount: 1,
      lastActiveAt: '2026-10-05T09:15:00Z',
      createdAt: '2024-09-01T00:00:00Z'
    },
    {
      id: 'rep-03',
      name: 'Geraldine Brooks',
      email: 'g.brooks@staff.campus.edu',
      phone: '(555) 673-4567',
      department: 'Office of the Registrar',
      role: 'STAFF',
      status: 'ACTIVE',
      submittedTicketsCount: 12,
      openTicketsCount: 3,
      lastActiveAt: '2026-10-03T16:45:00Z',
      createdAt: '2024-05-10T00:00:00Z'
    },
    {
      id: 'rep-04',
      name: 'Julian Henderson',
      email: 'j.henderson@student.campus.edu',
      phone: '(555) 564-3210',
      department: 'Computer Science & Software Eng.',
      role: 'STUDENT',
      status: 'ACTIVE',
      submittedTicketsCount: 3,
      openTicketsCount: 0,
      lastActiveAt: '2026-09-28T11:20:00Z',
      createdAt: '2024-09-15T00:00:00Z'
    },
    {
      id: 'rep-05',
      name: 'Prof. Evelyn Campbell',
      email: 'e.campbell@faculty.campus.edu',
      phone: '(555) 455-6789',
      department: 'School of Humanities',
      role: 'FACULTY',
      status: 'ACTIVE',
      submittedTicketsCount: 6,
      openTicketsCount: 1,
      lastActiveAt: '2026-10-02T13:00:00Z',
      createdAt: '2024-07-04T00:00:00Z'
    }
  ];

  private readonly reportersSignal = signal<Reporter[]>(this.loadFromStorage());
  public readonly reporters = this.reportersSignal.asReadonly();

  constructor(private http: HttpClient) {}

  private loadFromStorage(): Reporter[] {
    try {
      const stored = localStorage.getItem('fmc_reporters');
      return stored ? JSON.parse(stored) : this.initialReporters;
    } catch {
      return this.initialReporters;
    }
  }

  private persist(data: Reporter[]): void {
    this.reportersSignal.set(data);
    try {
      localStorage.setItem('fmc_reporters', JSON.stringify(data));
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  public getReporters(): Observable<Reporter[]> {
    return this.http.get<Reporter[]>(this.apiUrl).pipe(
      tap((apiData) => {
        if (apiData && apiData.length) {
          this.persist(apiData);
        }
      }),
      catchError(() => {
        return of(this.reportersSignal());
      })
    );
  }

  public toggleStatus(id: string, newStatus: ReporterStatus): Observable<Reporter> {
    return this.http.patch<Reporter>(`${this.apiUrl}/${id}/status`, { status: newStatus }).pipe(
      catchError(() => {
        const updated = this.reportersSignal().map((r) => (r.id === id ? { ...r, status: newStatus } : r));
        this.persist(updated);
        return of(updated.find((r) => r.id === id)!);
      })
    );
  }
}
