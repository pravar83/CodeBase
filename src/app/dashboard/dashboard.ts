import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Dashboard as DashboardData } from '../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  readonly data = signal<DashboardData | null>(null);
  readonly error = signal<string | null>(null);

  /** Largest daily login count, so bars can be scaled to the busiest day. */
  readonly maxLogins = computed(() => Math.max(1, ...(this.data()?.loginsByDay.map((d) => d.count) ?? [])));
  readonly maxRole = computed(() => Math.max(1, ...(this.data()?.usersByRole.map((r) => r.count) ?? [])));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error.set(null);
    this.api.getDashboard().subscribe({
      next: (d) => this.data.set(d),
      error: (e: HttpErrorResponse) => this.error.set(e.error?.message ?? e.message),
    });
  }

  pct(value: number, max: number): number {
    return Math.round((value / max) * 100);
  }

  /** API timestamps are UTC without a "Z"; mark them so they display in local time. */
  utc(value: string): string {
    return value.endsWith('Z') ? value : `${value}Z`;
  }
}
