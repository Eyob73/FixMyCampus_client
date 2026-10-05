import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CreateTechnicianDto, Technician, UpdateTechnicianDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TechnicianService {
  private readonly apiUrl = `${environment.apiUrl}/technicians`;

  private readonly initialTechnicians: Technician[] = [
    {
      id: 'tech-01',
      name: 'Marcus Vance',
      email: 'm.vance@facilities.campus.edu',
      phone: '(555) 234-8901',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      department: 'HVAC & Refrigeration',
      specialty: 'HVAC & Climate Systems',
      status: 'AVAILABLE',
      assignedTicketCount: 3,
      activeTicketsCount: 2,
      resolvedTicketsCount: 84,
      rating: 4.9,
      createdAt: '2025-01-15T08:00:00Z'
    },
    {
      id: 'tech-02',
      name: 'Elena Rostova',
      email: 'e.rostova@facilities.campus.edu',
      phone: '(555) 345-1289',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      department: 'Electrical Engineering & Power',
      specialty: 'High Voltage & Power Distribution',
      status: 'BUSY',
      assignedTicketCount: 6,
      activeTicketsCount: 5,
      resolvedTicketsCount: 112,
      rating: 4.95,
      createdAt: '2024-11-01T08:00:00Z'
    },
    {
      id: 'tech-03',
      name: 'David Okafor',
      email: 'd.okafor@facilities.campus.edu',
      phone: '(555) 456-7890',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      department: 'Plumbing & Hydronics',
      specialty: 'Hydronic & Main Line Hydraulics',
      status: 'AVAILABLE',
      assignedTicketCount: 2,
      activeTicketsCount: 1,
      resolvedTicketsCount: 96,
      rating: 4.8,
      createdAt: '2025-02-10T08:00:00Z'
    },
    {
      id: 'tech-04',
      name: 'Sarah Chen',
      email: 's.chen@facilities.campus.edu',
      phone: '(555) 567-3412',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      department: 'Structural & Carpentry',
      specialty: 'Building Envelope & Structural Carpentry',
      status: 'ON_CALL',
      assignedTicketCount: 1,
      activeTicketsCount: 1,
      resolvedTicketsCount: 65,
      rating: 4.85,
      createdAt: '2025-03-01T08:00:00Z'
    },
    {
      id: 'tech-05',
      name: 'James Reynolds',
      email: 'j.reynolds@facilities.campus.edu',
      phone: '(555) 678-9023',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      department: 'Access Control & Electronic Security',
      specialty: 'Electronic Access & Surveillance Hardware',
      status: 'AVAILABLE',
      assignedTicketCount: 4,
      activeTicketsCount: 3,
      resolvedTicketsCount: 78,
      rating: 4.75,
      createdAt: '2024-09-12T08:00:00Z'
    }
  ];

  private readonly techniciansSignal = signal<Technician[]>(this.loadFromStorage());
  public readonly technicians = this.techniciansSignal.asReadonly();

  constructor(private http: HttpClient) {}

  private loadFromStorage(): Technician[] {
    try {
      const stored = localStorage.getItem('fmc_technicians');
      return stored ? JSON.parse(stored) : this.initialTechnicians;
    } catch {
      return this.initialTechnicians;
    }
  }

  private persist(data: Technician[]): void {
    this.techniciansSignal.set(data);
    try {
      localStorage.setItem('fmc_technicians', JSON.stringify(data));
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  public getTechnicians(): Observable<Technician[]> {
    return this.http.get<Technician[]>(this.apiUrl).pipe(
      tap((apiTechs) => {
        if (apiTechs && apiTechs.length) {
          this.persist(apiTechs);
        }
      }),
      catchError(() => {
        return of(this.techniciansSignal());
      })
    );
  }

  public getTechnicianById(id: string): Observable<Technician | undefined> {
    return this.http.get<Technician>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        return of(this.techniciansSignal().find((t) => t.id === id));
      })
    );
  }

  public createTechnician(dto: CreateTechnicianDto): Observable<Technician> {
    return this.http.post<Technician>(this.apiUrl, dto).pipe(
      catchError(() => {
        const newTech: Technician = {
          ...dto,
          id: 'tech-' + Math.random().toString(36).substring(2, 7),
          assignedTicketCount: 0,
          activeTicketsCount: 0,
          resolvedTicketsCount: 0,
          rating: 5.0,
          createdAt: new Date().toISOString()
        };
        const updated = [newTech, ...this.techniciansSignal()];
        this.persist(updated);
        return of(newTech);
      })
    );
  }

  public updateTechnician(dto: UpdateTechnicianDto): Observable<Technician> {
    return this.http.put<Technician>(`${this.apiUrl}/${dto.id}`, dto).pipe(
      catchError(() => {
        const updated = this.techniciansSignal().map((t) => (t.id === dto.id ? { ...t, ...dto } : t));
        this.persist(updated);
        const saved = updated.find((t) => t.id === dto.id)!;
        return of(saved);
      })
    );
  }

  public deleteTechnician(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => {
        const updated = this.techniciansSignal().filter((t) => t.id !== id);
        this.persist(updated);
        return of(true);
      })
    );
  }
}
