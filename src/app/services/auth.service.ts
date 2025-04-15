import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { AuthResponse } from 'app/models/auth-response.model';
import { LoginRequest } from 'app/models/login-request.model';
import { RegisterRequest } from 'app/models/register-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    if (data.role === 'customer') {
    return this.http.post<AuthResponse>(`${this.apiUrl}/customer`, data).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
      })
    );
  }else if (data.role === 'professional') {
    return this.http.post<AuthResponse>(`${this.apiUrl}/professional`, data).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
      })
    );
  }
  else {
    throw new Error('Invalid role');
  }
}

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
