import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { AuthResponse } from 'app/models/auth-response.model';
import { LoginRequest } from 'app/models/login-request.model';
import { RegisterRequest } from 'app/models/register-request.model';
import { customer } from 'app/models/customer.model';
import { professional } from 'app/models/professional.model';
import { HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private _userService: UserService, private router: Router) { }



  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        
        localStorage.setItem('token', res.token);
        this._userService.getUserAppointments();
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    if (data.role === 'customer') {
      return this.http.post<AuthResponse>(`${this.apiUrl}/customer`, data).pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('userId', JSON.stringify(res.userId));
        })
      );
    } else if (data.role === 'professional') {
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
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): 'customer' | 'professional' | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
  
    try {
      const decoded: any = jwtDecode(token);
      return decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  }
  

}
