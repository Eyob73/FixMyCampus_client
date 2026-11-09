import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Reporter,
  ReporterStatus,
  CreateReporterRequest,
  UpdateReporterRequest,
  ReporterQueryParameters,
  PaginatedResult,
  ReporterDetail,
  ReporterStats
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReporterService {
  private readonly apiUrl = `${environment.apiUrl}/admin/reporters`;

  constructor(private http: HttpClient) {}

  public getReporters(params?: ReporterQueryParameters): Observable<PaginatedResult<Reporter>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.status && params.status !== 'ALL') httpParams = httpParams.set('status', params.status);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDescending !== undefined) httpParams = httpParams.set('sortDescending', params.sortDescending.toString());
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize !== undefined) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<PaginatedResult<Reporter>>(this.apiUrl, { params: httpParams });
  }

  public getAllReporters(): Observable<Reporter[]> {
    return this.http.get<Reporter[]>(this.apiUrl, { params: new HttpParams().set('all', 'true') });
  }

  public getReporterStats(): Observable<ReporterStats> {
    return this.http.get<ReporterStats>(`${this.apiUrl}/stats`);
  }

  public getReporterById(id: string): Observable<ReporterDetail> {
    return this.http.get<ReporterDetail>(`${this.apiUrl}/${id}`);
  }

  public createReporter(dto: CreateReporterRequest): Observable<Reporter> {
    return this.http.post<Reporter>(this.apiUrl, dto);
  }

  public updateReporter(id: string, dto: UpdateReporterRequest): Observable<Reporter> {
    return this.http.put<Reporter>(`${this.apiUrl}/${id}`, dto);
  }

  public deleteReporter(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  public updateStatus(id: string, status: ReporterStatus): Observable<Reporter> {
    return this.http.patch<Reporter>(`${this.apiUrl}/${id}/status`, { status });
  }

  public toggleStatus(id: string, newStatus: ReporterStatus): Observable<Reporter> {
    return this.updateStatus(id, newStatus);
  }
}
