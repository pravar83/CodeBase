import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

/** Layout for signed-in pages: top bar with navigation and the current user. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header>
      <strong class="brand">MyApp</strong>
      <nav>
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/users" routerLinkActive="active">Users</a>
      </nav>
      @if (auth.user(); as user) {
        <div class="user">
          <span>{{ user.firstName || user.userName }}</span>
          @if (auth.isAdmin()) { <span class="badge">Admin</span> }
          <button (click)="auth.logout()">Sign out</button>
        </div>
      }
    </header>
    <main><router-outlet /></main>
  `,
  styles: `
    header { display: flex; flex-wrap: wrap; gap: 1rem 2rem; align-items: center; padding: 0.7rem 1.5rem; background: #111827; color: #fff; }
    .brand { font-size: 1.1rem; }
    nav { display: flex; gap: 1.25rem; }
    nav a { color: #cbd5e1; text-decoration: none; }
    nav a.active { color: #fff; font-weight: 600; }
    .user { margin-left: auto; display: flex; gap: 0.75rem; align-items: center; }
    .badge { font-size: 0.75rem; padding: 0.1rem 0.5rem; border-radius: 999px; background: #2563eb; }
    .user button { background: transparent; color: #fff; border-color: #4b5563; }
    main { max-width: 1100px; margin: 1.5rem auto; padding: 0 1rem; }
  `,
})
export class Shell {
  protected readonly auth = inject(AuthService);
}
