import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    this.http.get<string[]>(`${this.baseUrl}/buildings`).subscribe(data => {
      this.buildings.set(data);
    });

    this.http.get<string[]>(`${this.baseUrl}/categories`).subscribe(data => {
      this.categories.set(data);
    });
  }
}
