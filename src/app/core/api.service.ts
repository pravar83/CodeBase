import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateUser, Dashboard, Role, UpdateUser, User } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;

  getUsers() {
    return this.http.get<User[]>(`${this.base}/users`);
  }

  getUser(id: number) {
    return this.http.get<User>(`${this.base}/users/${id}`);
  }

  createUser(user: CreateUser) {
    return this.http.post<User>(`${this.base}/users`, user);
  }

  updateUser(id: number, user: UpdateUser) {
    return this.http.put<void>(`${this.base}/users/${id}`, user);
  }

  deleteUser(id: number) {
    return this.http.delete<void>(`${this.base}/users/${id}`);
  }

  getRoles() {
    return this.http.get<Role[]>(`${this.base}/roles`);
  }

  getDashboard() {
    return this.http.get<Dashboard>(`${this.base}/dashboard`);
  }
}
