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
    return this.http.get<Technician[]>(this.apiUrl);
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
