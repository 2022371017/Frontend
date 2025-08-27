// src/app/pages/dashboard/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:5000/logs'; // Gateway

  constructor(private http: HttpClient) {}

  getStatusCount(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status-count`).pipe(
      map(list => (Array.isArray(list) ? list : []).map(i => ({
        status: String(i?._id),
        count: Number(i?.total ?? 0)
      })))
    );
  }

  getAverageResponse(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/average-response`).pipe(
      map(obj => ({ avgMs: Math.round(Number(obj?.promedio_ms ?? 0)) }))
    );
  }

  getMinMaxResponse(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/minmax-response`).pipe(
      map(obj => ({
        minMs: Number(obj?.mas_rapido ?? 0),
        maxMs: Number(obj?.mas_lento ?? 0)
      }))
    );
  }

  getApiUsage(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api-usage`).pipe(
      map(list => (Array.isArray(list) ? list : []).map(i => ({
        path: String(i?._id ?? ''),
        count: Number(i?.total ?? 0)
      })))
    );
  }

  getTotalLogs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/total`).pipe(
      map(obj => ({ total: Number(obj?.total_logs ?? 0) }))
    );
  }
}