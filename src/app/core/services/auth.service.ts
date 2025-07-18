import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse } from '../../shared/models/authResponse.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  signIn(credentials: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/signin`, credentials).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId.toString());
        localStorage.setItem('userRole', response.role);
        
      }),
      catchError((error: HttpErrorResponse) => {
        let message = 'An unknown error occurred.';
        if (error.error?.message) {
          message = error.error.message;
        } else if (error.status === 0) {
          message = 'Unable to connect to the server.';
        } else if (error.status === 401) {
          message = 'Invalid email or password.';
        }
        return throwError(() => new Error(message));
      })
    );
  }
}
