// pages/dashboard-logs/dashboard-logs.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard-logs',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ChartModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // KPIs
  totalLogs = 0;
  avgMs = 0;
  minMs = 0;
  maxMs = 0;
  mostUsedApi = '';
  leastUsedApi = '';

  // Charts
  statusChartData: any;
  statusChartOptions: any;
  usageChartData: any;
  usageChartOptions: any;

  loading = false;

  constructor(private svc: DashboardService) {}

  ngOnInit(): void {
    this.load();
  }

  refreshData(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;

   forkJoin({
     status: this.svc.getStatusCount().pipe(catchError(() => of([]))),
     avg: this.svc.getAverageResponse().pipe(catchError(() => of({ avgMs: 0 }))),
     minmax: this.svc.getMinMaxResponse().pipe(catchError(() => of({ minMs: 0, maxMs: 0 }))),
     usage: this.svc.getApiUsage().pipe(catchError(() => of([]))),
     total: this.svc.getTotalLogs().pipe(catchError(() => of({ total: 0 })))
      }).subscribe({
      next: ({ status, avg, minmax, usage, total }) => {
        // Total
        this.totalLogs = (total as any)?.total ?? (total as any)?.count ?? (typeof total === 'number' ? total : 0);

        // Tiempos
        this.avgMs = (avg as any)?.avgMs ?? (avg as any)?.average ?? (typeof avg === 'number' ? avg : 0);
        this.minMs = (minmax as any)?.minMs ?? (minmax as any)?.min ?? 0;
        this.maxMs = (minmax as any)?.maxMs ?? (minmax as any)?.max ?? 0;

        // Status chart
        const statusItems = Array.isArray(status)
          ? status.map((s: any) => ({ status: String(s.status), count: Number(s.count) || 0 }))
          : Object.entries(status as Record<string, number>).map(([k, v]) => ({ status: String(k), count: Number(v) || 0 }));

        const statusLabels = statusItems.map(s => s.status);
        const statusCounts = statusItems.map(s => s.count);

        this.statusChartData = {
          labels: statusLabels,
          datasets: [{ 
            label: 'Cantidad', 
            data: statusCounts, 
            backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            cutout: '60%'
          }]
        };
        this.statusChartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  return context.label + ': ' + context.parsed;
                }
              }
            }
          }
        };

        // Uso de APIs
        const usageItems = Array.isArray(usage)
          ? usage.map((u: any) => ({ path: String(u.path), count: Number(u.count) || 0 }))
          : Object.entries(usage as Record<string, number>).map(([k, v]) => ({ path: String(k), count: Number(v) || 0 }));

        const sorted = usageItems.sort((a, b) => b.count - a.count);
        this.mostUsedApi = sorted[0]?.path ?? '';
        this.leastUsedApi = sorted[sorted.length - 1]?.path ?? '';

        const top = sorted.slice(0, 7);
        this.usageChartData = {
          labels: top.map(t => t.path),
          datasets: [{ label: 'Consumos', data: top.map(t => t.count), backgroundColor: ['#3b82f6','#22c55e','#ef4444','#f59e0b','#06b6d4','#a78bfa','#10b981'] }]
        };
        this.usageChartOptions = {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  return context.parsed.x + ' requests';
                }
              }
            }
          },
          scales: { 
            x: { 
              grid: { color: '#e5e7eb' },
              ticks: { color: '#6b7280' }
            }, 
            y: { 
              grid: { display: false },
              ticks: { color: '#6b7280' }
            }
          }
        };

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('No se pudieron cargar las métricas de logs');
      }
    });
  }
}