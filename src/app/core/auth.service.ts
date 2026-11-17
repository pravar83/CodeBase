import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from './models';

interface Session {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  user: User;
}

const STORAGE_KEY = 'myapp.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}/api/auth`;

  private readonly session = signal<Session | null>(readSession());
  private refreshInFlight: Observable<AuthResponse> | null = null;

  readonly user = computed(() => this.session()?.user ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly isAdmin = computed(() => this.user()?.roles.includes('Admin') ?? false);

  get accessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }

  login(userNameOrEmail: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, { userNameOrEmail, password })
      .pipe(tap((res) => this.store(res)));
  }

  /** Exchanges the refresh token for new tokens. Concurrent callers share one request. */
  refresh(): Observable<AuthResponse> {
    const refreshToken = this.session()?.refreshToken;
    if (!refreshToken) throw new Error('No refresh token');

    this.refreshInFlight ??= this.http
      .post<AuthResponse>(`${this.base}/refresh`, { refreshToken })
      .pipe(
        tap((res) => this.store(res)),
        finalize(() => (this.refreshInFlight = null)),
        shareReplay(1),
      );
    return this.refreshInFlight;
  }

  logout(): void {
    const refreshToken = this.session()?.refreshToken;
    if (refreshToken) {
      this.http.post(`${this.base}/logout`, { refreshToken }).subscribe({ error: () => {} });
    }
    this.clear();
    this.router.navigate(['/login']);
  }

  /** Drops the local session without calling the API (used when the session is already invalid). */
  clear(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  private store(res: AuthResponse): void {
    const session: Session = {
      accessToken: res.accessToken,
      expiresAt: res.expiresAt,
      refreshToken: res.refreshToken,
      user: res.user,
    };
    this.session.set(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {}
  }
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
