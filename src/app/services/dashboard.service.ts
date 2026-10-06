import { Injectable, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TicketStore } from '../store/ticket.store';
import { CategoryMetric, DashboardMetrics, PriorityMetric, WeeklyVelocity } from '../models';
import { Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;
  private http = inject(HttpClient);
  private ticketStore = inject(TicketStore);


  public getReporterStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/tickets/dashboard`);
  }

  public getAdminStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/admin/dashboard`);
  }

  public getTechnicianStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/technician/dashboard`);
  }
}
