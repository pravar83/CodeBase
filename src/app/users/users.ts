import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Role, User } from '../core/models';

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);

  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    userName: ['', Validators.required],
    firstName: [''],
    lastName: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['User'],
  });

  ngOnInit(): void {
    this.load();
    this.api.getRoles().subscribe((r) => this.roles.set(r));
  }

  load(): void {
    this.loading.set(true);
    this.api.getUsers().subscribe({
      next: (u) => {
        this.users.set(u);
        this.loading.set(false);
      },
      error: (e) => this.fail(e),
    });
  }

  add(): void {
    if (this.form.invalid) return;
    const { role, ...rest } = this.form.getRawValue();
    this.api.createUser({ ...rest, roles: role ? [role] : [] }).subscribe({
      next: (u) => {
        this.users.update((list) => [...list, u]);
        this.form.reset({ role: 'User' });
        this.error.set(null);
      },
      error: (e) => this.fail(e),
    });
  }

  toggleActive(user: User): void {
    const isActive = !user.isActive;
    this.api
      .updateUser(user.id, { email: user.email, firstName: user.firstName, lastName: user.lastName, isActive, roles: user.roles })
      .subscribe({
        next: () => this.users.update((list) => list.map((u) => (u.id === user.id ? { ...u, isActive } : u))),
        error: (e) => this.fail(e),
      });
  }

  remove(user: User): void {
    if (!confirm(`Delete ${user.userName}?`)) return;
    this.api.deleteUser(user.id).subscribe({
      next: () => this.users.update((list) => list.filter((u) => u.id !== user.id)),
      error: (e) => this.fail(e),
    });
  }

  private fail(e: HttpErrorResponse): void {
    this.loading.set(false);
    this.error.set(e.error?.message ?? e.error?.title ?? e.message);
  }
}
