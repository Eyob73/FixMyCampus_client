import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CreateTechnicianDto, Technician, UpdateTechnicianDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TechnicianService {
  private readonly apiUrl = `${environment.apiUrl}/admin/technicians`;

  constructor(private http: HttpClient) {}

  public getTechnicians(): Observable<Technician[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(apiTechs => apiTechs.map((t, index) => ({
        id: t.id,
        name: t.fullName || t.name,
        email: t.email,
        phone: '(555) 000-0000',
        department: 'General Maintenance',
        specialty: 'General',
        status: (index % 2 === 0 ? 'AVAILABLE' : 'BUSY') as any,
        assignedTicketCount: 0,
        activeTicketsCount: 0,
        resolvedTicketsCount: 0,
        rating: 5.0,
        createdAt: new Date().toISOString()
      })))
    );
  }

  public getTechnicianById(id: string): Observable<Technician> {
    return this.http.get<Technician>(`${this.apiUrl}/${id}`);
  }

  public createTechnician(dto: CreateTechnicianDto): Observable<Technician> {
    return this.http.post<Technician>(this.apiUrl, dto);
  }

  public updateTechnician(dto: UpdateTechnicianDto): Observable<Technician> {
    return this.http.put<Technician>(`${this.apiUrl}/${dto.id}`, dto);
  }

  public deleteTechnician(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
