import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reporter, ReporterStatus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReporterService {
  private readonly apiUrl = `${environment.apiUrl}/admin/reporters`;

  constructor(private http: HttpClient) {}

  public getReporters(): Observable<Reporter[]> {
    return this.http.get<Reporter[]>(this.apiUrl);
  }

  public toggleStatus(id: string, newStatus: ReporterStatus): Observable<Reporter> {
    return this.http.patch<Reporter>(`${this.apiUrl}/${id}/status`, { status: newStatus });
  }
}
