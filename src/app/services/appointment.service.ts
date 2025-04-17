import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appointment } from 'app/models/appointment.model';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  apiUrl = environment.apiUrl + '/appointment';
  constructor(private http: HttpClient) { }


  confirmAppointment(appointmentId: string): Observable<appointment> {
    return this.http.patch<appointment>(
      `${this.apiUrl}/appointments/${appointmentId}`,
      { status: 'confirmed' }
    ).pipe(
      tap((res) => {
        console.log('Appointment confirmed:', res);
      })
    );
  }

}