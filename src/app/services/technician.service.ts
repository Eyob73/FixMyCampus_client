import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateTechnicianDto,
  Technician,
  UpdateTechnicianDto,
  TechnicianQueryParameters,
  TechnicianStats,
  TechnicianDetail
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class TechnicianService {
  private readonly apiUrl = `${environment.apiUrl}/admin/technicians`;

  constructor(private http: HttpClient) {}

  public getTechnicians(): Observable<Technician[]> {
    return this.http.get<Technician[]>(`${this.apiUrl}?all=true`);
  }

  public getTechniciansPaginated(params: TechnicianQueryParameters): Observable<{
    items: Technician[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status && params.status !== 'ALL') httpParams = httpParams.set('status', params.status);
    if (params.department && params.department !== 'ALL') httpParams = httpParams.set('department', params.department);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDescending !== undefined) httpParams = httpParams.set('sortDescending', params.sortDescending.toString());
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  public getTechnicianStats(): Observable<TechnicianStats> {
    return this.http.get<TechnicianStats>(`${this.apiUrl}/stats`);
  }

  public getTechnicianById(id: string): Observable<TechnicianDetail> {
    return this.http.get<TechnicianDetail>(`${this.apiUrl}/${id}`);
  }

  public createTechnician(dto: CreateTechnicianDto): Observable<Technician> {
    return this.http.post<Technician>(this.apiUrl, dto);
  }

  public updateTechnician(id: string, dto: Partial<CreateTechnicianDto>): Observable<Technician> {
    return this.http.put<Technician>(`${this.apiUrl}/${id}`, dto);
  }

  public updateTechnicianStatus(id: string, status: string): Observable<Technician> {
    return this.http.patch<Technician>(`${this.apiUrl}/${id}/status`, { status });
  }

  public deleteTechnician(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
