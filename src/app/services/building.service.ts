import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Building, CreateBuildingDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private readonly apiUrl = `${environment.apiUrl}/buildings`;

  private readonly initialBuildings: Building[] = [
    {
      id: 'bld-01',
      code: 'SCI-A',
      name: 'Physical Sciences Hall & Labs',
      zone: 'STEM_COMPLEX',
      floors: 5,
      totalRooms: 120,
      activeTicketsCount: 7,
      managerName: 'Robert Vance',
      managerContact: 'r.vance@facilities.campus.edu',
      status: 'OPERATIONAL',
      createdAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 'bld-02',
      code: 'ENG-MAIN',
      name: 'Engineering Research Center',
      zone: 'STEM_COMPLEX',
      floors: 6,
      totalRooms: 145,
      activeTicketsCount: 4,
      managerName: 'Kirsten Dale',
      managerContact: 'k.dale@facilities.campus.edu',
      status: 'OPERATIONAL',
      createdAt: '2024-01-12T00:00:00Z'
    },
    {
      id: 'bld-03',
      code: 'LIB-CENTRAL',
      name: 'W.E.B. Du Bois Memorial Library',
      zone: 'CENTRAL_QUAD',
      floors: 8,
      totalRooms: 90,
      activeTicketsCount: 2,
      managerName: 'Arthur Dent',
      managerContact: 'a.dent@facilities.campus.edu',
      status: 'OPERATIONAL',
      createdAt: '2024-02-01T00:00:00Z'
    },
    {
      id: 'bld-04',
      code: 'RES-NORTH',
      name: 'North Quad Residential Commons',
      zone: 'NORTH_CAMPUS',
      floors: 4,
      totalRooms: 210,
      activeTicketsCount: 8,
      managerName: 'Maria Gallagher',
      managerContact: 'm.gallagher@facilities.campus.edu',
      status: 'MAINTENANCE_SURGE',
      createdAt: '2024-02-15T00:00:00Z'
    },
    {
      id: 'bld-05',
      code: 'ATH-PAV',
      name: 'Campus Pavilion & Aquatic Center',
      zone: 'WEST_ATHLETICS',
      floors: 3,
      totalRooms: 45,
      activeTicketsCount: 3,
      managerName: 'Coach Thomas Harris',
      managerContact: 't.harris@athletics.campus.edu',
      status: 'OPERATIONAL',
      createdAt: '2024-03-01T00:00:00Z'
    },
    {
      id: 'bld-06',
      code: 'ADM-TOWER',
      name: 'Founders Administrative Tower',
      zone: 'CENTRAL_QUAD',
      floors: 10,
      totalRooms: 160,
      activeTicketsCount: 1,
      managerName: 'Helen Morales',
      managerContact: 'h.morales@facilities.campus.edu',
      status: 'OPERATIONAL',
      createdAt: '2024-01-05T00:00:00Z'
    }
  ];

  private readonly buildingsSignal = signal<Building[]>(this.loadFromStorage());
  public readonly buildings = this.buildingsSignal.asReadonly();

  constructor(private http: HttpClient) {}

  private loadFromStorage(): Building[] {
    try {
      const stored = localStorage.getItem('fmc_buildings');
      return stored ? JSON.parse(stored) : this.initialBuildings;
    } catch {
      return this.initialBuildings;
    }
  }

  private persist(data: Building[]): void {
    this.buildingsSignal.set(data);
    try {
      localStorage.setItem('fmc_buildings', JSON.stringify(data));
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  public getBuildings(): Observable<Building[]> {
    return this.http.get<Building[]>(this.apiUrl).pipe(
      tap((apiBuildings) => {
        if (apiBuildings && apiBuildings.length) {
          this.persist(apiBuildings);
        }
      }),
      catchError(() => {
        return of(this.buildingsSignal());
      })
    );
  }

  public createBuilding(dto: CreateBuildingDto): Observable<Building> {
    return this.http.post<Building>(this.apiUrl, dto).pipe(
      catchError(() => {
        const newBuilding: Building = {
          ...dto,
          id: 'bld-' + Math.random().toString(36).substring(2, 7),
          activeTicketsCount: 0,
          status: 'OPERATIONAL',
          createdAt: new Date().toISOString()
        };
        const updated = [newBuilding, ...this.buildingsSignal()];
        this.persist(updated);
        return of(newBuilding);
      })
    );
  }

  public updateBuilding(id: string, partial: Partial<Building>): Observable<Building> {
    return this.http.put<Building>(`${this.apiUrl}/${id}`, partial).pipe(
      catchError(() => {
        const updated = this.buildingsSignal().map((b) => (b.id === id ? { ...b, ...partial } : b));
        this.persist(updated);
        return of(updated.find((b) => b.id === id)!);
      })
    );
  }

  public deleteBuilding(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => {
        const updated = this.buildingsSignal().filter((b) => b.id !== id);
        this.persist(updated);
        return of(true);
      })
    );
  }
}
