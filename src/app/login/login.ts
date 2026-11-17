import { Component, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Bound from the ?returnUrl= query parameter. */
  readonly returnUrl = input<string>();

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = inject(FormBuilder).nonNullable.group({
    userNameOrEmail: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);

    const { userNameOrEmail, password } = this.form.getRawValue();
    this.auth.login(userNameOrEmail, password).subscribe({
      next: () => {
        const target = this.returnUrl();
        // Only follow app-relative return URLs.
        this.router.navigateByUrl(target?.startsWith('/') && !target.startsWith('//') ? target : '/dashboard');
      },
      error: (e: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set(e.status === 0 ? 'Cannot reach the server. Is the API running?' : (e.error?.message ?? 'Sign-in failed.'));
      },
    });
  }
}
