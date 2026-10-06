import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Building, CreateBuildingDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private readonly apiUrl = `${environment.apiUrl}/buildings`;

  constructor(private http: HttpClient) {}

  public getBuildings(): Observable<Building[]> {
    return this.http.get<Building[]>(this.apiUrl);
  }

  public createBuilding(dto: CreateBuildingDto): Observable<Building> {
    return this.http.post<Building>(this.apiUrl, dto);
  }

  public updateBuilding(id: string, partial: Partial<Building>): Observable<Building> {
    return this.http.put<Building>(`${this.apiUrl}/${id}`, partial);
  }

  public deleteBuilding(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
