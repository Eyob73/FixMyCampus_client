import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Metadata`;

  readonly buildings = signal<string[]>([]);
  readonly categories = signal<string[]>([]);

  constructor() {
    this.loadMetadata();
  }

  loadMetadata() {
    this.http.get<string[]>(`${this.baseUrl}/buildings`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.buildings.set(data || []);
    });

    this.http.get<string[]>(`${this.baseUrl}/categories`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.categories.set(data || []);
    });
  }
}
