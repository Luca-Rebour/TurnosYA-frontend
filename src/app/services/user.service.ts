import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { appointment } from 'app/models/appointment.model';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.apiUrl;
  private appointmentsSubject = new BehaviorSubject<appointment[]>([]);
  appointments$ = this.appointmentsSubject.asObservable();

  setAppointments(data: appointment[]) {
    this.appointmentsSubject.next(data);
  }


  constructor(private http: HttpClient) { }

  getUserAppointments(): Observable<appointment[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.get<appointment[]>(`${this.apiUrl}/appointment/userAppointments`, { headers }).pipe(
      tap(response => {
        this.appointmentsSubject.next(response);
      })
    );
  }

  getUserName(): string | null {
       const token = localStorage.getItem('token');
       if (!token) return null;
     
       try {
         const decoded: any = jwtDecode(token);         
         var name: string = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
         return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
       } catch (err) {
         console.error('Error decoding token:', err);
         return null;
       }
}
}
